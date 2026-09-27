import { BadRequestException, ForbiddenException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import type { BillingInterval, PlanId } from '@pivoa/shared';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';

const PAID: Array<Exclude<PlanId, 'free'>> = ['plus', 'pro'];

export interface PaypalSubscription {
  id: string;
  plan_id?: string;
  status?: string;
  custom_id?: string;
  subscriber?: { payer_id?: string };
  billing_info?: { next_billing_time?: string };
  links?: { href: string; rel: string; method?: string }[];
}

interface PaypalEvent {
  event_type?: string;
  resource?: { id?: string; custom_id?: string };
}

@Injectable()
export class BillingService {
  private token: { value: string; expiresAt: number } | null = null;

  constructor(
    private readonly config: ConfigService,
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  private baseUrl() {
    return this.config.get<string>('PAYPAL_MODE') === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private assertConfigured() {
    const id = this.config.get<string>('PAYPAL_CLIENT_ID');
    const secret = this.config.get<string>('PAYPAL_CLIENT_SECRET');
    if (!id || !secret) throw new ServiceUnavailableException('Billing is not configured');
    return { id, secret };
  }

  private async accessToken() {
    if (this.token && this.token.expiresAt > Date.now() + 30_000) return this.token.value;
    const { id, secret } = this.assertConfigured();
    const response = await fetch(`${this.baseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = (await response.json().catch(() => ({}))) as { access_token?: string; expires_in?: number };
    if (!response.ok || !data.access_token) {
      throw new ServiceUnavailableException('Could not reach PayPal');
    }
    this.token = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 300) * 1000,
    };
    return data.access_token;
  }

  private async paypal<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const token = await this.accessToken();
    const response = await fetch(`${this.baseUrl()}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (response.status === 204) return {} as T;
    const data = (await response.json().catch(() => ({}))) as { message?: string; details?: { description?: string }[] };
    if (!response.ok) {
      const detail = data.details?.[0]?.description || data.message || 'PayPal request failed';
      throw new BadRequestException(detail);
    }
    return data as T;
  }

  planId(plan: Exclude<PlanId, 'free'>, interval: BillingInterval): string {
    const key =
      plan === 'plus'
        ? interval === 'year'
          ? 'PAYPAL_PLAN_PLUS_YEARLY'
          : 'PAYPAL_PLAN_PLUS_MONTHLY'
        : interval === 'year'
          ? 'PAYPAL_PLAN_PRO_YEARLY'
          : 'PAYPAL_PLAN_PRO_MONTHLY';
    const id = this.config.get<string>(key);
    if (!id) throw new ServiceUnavailableException(`Missing PayPal plan for ${plan} ${interval}`);
    return id;
  }

  planForId(planId: string | undefined): Exclude<PlanId, 'free'> | null {
    if (!planId) return null;
    for (const plan of PAID) {
      for (const interval of ['month', 'year'] as BillingInterval[]) {
        const key =
          plan === 'plus'
            ? interval === 'year'
              ? 'PAYPAL_PLAN_PLUS_YEARLY'
              : 'PAYPAL_PLAN_PLUS_MONTHLY'
            : interval === 'year'
              ? 'PAYPAL_PLAN_PRO_YEARLY'
              : 'PAYPAL_PLAN_PRO_MONTHLY';
        if (this.config.get<string>(key) === planId) return plan;
      }
    }
    return null;
  }

  async createCheckout(input: {
    userId: string;
    plan: Exclude<PlanId, 'free'>;
    interval: BillingInterval;
    origin: string;
  }) {
    const created = await this.paypal<PaypalSubscription>('/v1/billing/subscriptions', {
      method: 'POST',
      body: {
        plan_id: this.planId(input.plan, input.interval),
        custom_id: input.userId,
        application_context: {
          brand_name: 'Pivoa',
          user_action: 'SUBSCRIBE_NOW',
          shipping_preference: 'NO_SHIPPING',
          return_url: `${input.origin}/settings?billing=success`,
          cancel_url: `${input.origin}/pricing?billing=cancel`,
        },
      },
    });
    await this.supabase.from('users').update({ paypal_subscription_id: created.id }).eq('id', input.userId);
    const approve = created.links?.find((link) => link.rel === 'approve')?.href;
    if (!approve) throw new BadRequestException('PayPal did not return an approval link');
    return approve;
  }

  async getSubscription(subscriptionId: string) {
    return this.paypal<PaypalSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
  }

  async syncForUser(userId: string, subscriptionId: string) {
    const subscription = await this.getSubscription(subscriptionId);
    if (subscription.custom_id !== userId) {
      throw new ForbiddenException('This subscription belongs to another account');
    }
    await this.applySubscription(userId, subscription);
    return subscription;
  }

  async cancelForUser(userId: string, subscriptionId: string | null) {
    if (!subscriptionId) throw new BadRequestException('This account has no PayPal subscription');
    await this.paypal(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
      method: 'POST',
      body: { reason: 'Cancelled from Pivoa' },
    });
    const subscription = await this.getSubscription(subscriptionId);
    await this.applySubscription(userId, subscription);
  }

  async applySubscription(userId: string, subscription: PaypalSubscription) {
    const { data: existing } = await this.supabase
      .from('users')
      .select('complimentary, current_period_end')
      .eq('id', userId)
      .maybeSingle();

    const status = (subscription.status || '').toUpperCase();
    const payerId = subscription.subscriber?.payer_id;
    const next = subscription.billing_info?.next_billing_time ?? null;
    const mapped = this.planForId(subscription.plan_id);
    const patch: Record<string, unknown> = { paypal_subscription_id: subscription.id };
    if (payerId) patch.paypal_payer_id = payerId;

    const complimentary = Boolean(existing?.complimentary);

    if (status === 'ACTIVE' && mapped) {
      patch.plan = mapped;
      patch.subscription_status = 'active';
      patch.complimentary = false;
      if (next) patch.current_period_end = next;
    } else if (status === 'SUSPENDED') {
      patch.subscription_status = 'past_due';
    } else if (status === 'CANCELLED' || status === 'EXPIRED') {
      patch.subscription_status = 'canceled';
      if (next) patch.current_period_end = next;
      else if (!existing?.current_period_end) patch.current_period_end = new Date().toISOString();
      if (status === 'EXPIRED' && !complimentary) patch.plan = 'free';
    }

    await this.supabase.from('users').update(patch).eq('id', userId);
  }

  async markPastDue(subscriptionId: string) {
    await this.supabase
      .from('users')
      .update({ subscription_status: 'past_due' })
      .eq('paypal_subscription_id', subscriptionId);
  }

  async userIdForSubscription(subscriptionId: string, customId?: string) {
    if (customId) return customId;
    const { data } = await this.supabase
      .from('users')
      .select('id')
      .eq('paypal_subscription_id', subscriptionId)
      .maybeSingle();
    return (data?.id as string | undefined) ?? null;
  }

  async verifyAndHandle(headers: Record<string, string | string[] | undefined>, event: PaypalEvent) {
    const webhookId = this.config.get<string>('PAYPAL_WEBHOOK_ID');
    if (!webhookId) throw new ServiceUnavailableException('PayPal webhook is not configured');

    const header = (name: string) => {
      const value = headers[name] ?? headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    };

    const verification = await this.paypal<{ verification_status?: string }>('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: {
        auth_algo: header('paypal-auth-algo'),
        cert_url: header('paypal-cert-url'),
        transmission_id: header('paypal-transmission-id'),
        transmission_sig: header('paypal-transmission-sig'),
        transmission_time: header('paypal-transmission-time'),
        webhook_id: webhookId,
        webhook_event: event,
      },
    });
    if (verification.verification_status !== 'SUCCESS') {
      throw new BadRequestException('Invalid PayPal webhook signature');
    }

    const type = event.event_type || '';
    const resourceId = event.resource?.id;
    if (!resourceId) return;

    if (type === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
      await this.markPastDue(resourceId);
      return;
    }
    if (!type.startsWith('BILLING.SUBSCRIPTION.')) return;

    const subscription = await this.getSubscription(resourceId);
    const userId = await this.userIdForSubscription(subscription.id, subscription.custom_id || event.resource?.custom_id);
    if (!userId) return;
    await this.applySubscription(userId, subscription);
  }
}
