import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { User } from '@supabase/supabase-js';
import type { CheckoutResult } from '@pivoa/shared';
import { CurrentUser, Public } from '../auth/decorators/index.js';
import { BillingService, type PaypalSubscription } from './billing.service.js';
import { EntitlementsService } from './entitlements.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { SyncBillingDto } from './dto/sync.dto.js';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly entitlements: EntitlementsService,
    private readonly config: ConfigService,
  ) {}

  @Post('checkout')
  async checkout(@CurrentUser() user: User, @Body() dto: CheckoutDto): Promise<CheckoutResult> {
    const origin = this.config.get<string>('WEB_ORIGIN', 'http://localhost:5173').replace(/\/$/, '');
    const url = await this.billing.createCheckout({
      userId: user.id,
      plan: dto.plan,
      interval: dto.interval,
      origin,
    });
    return { url };
  }

  @Post('sync')
  async sync(@CurrentUser() user: User, @Body() dto: SyncBillingDto) {
    await this.billing.syncForUser(user.id, dto.subscriptionId);
    return { ok: true };
  }

  @Post('cancel')
  async cancel(@CurrentUser() user: User) {
    const row = await this.entitlements.getUserRow(user.id);
    await this.billing.cancelForUser(user.id, row.paypal_subscription_id);
    return { ok: true };
  }

  @Public()
  @Post('webhook')
  async webhook(@Req() req: Request, @Headers() headers: Record<string, string | string[] | undefined>) {
    const event = req.body as { event_type?: string; resource?: PaypalSubscription };
    await this.billing.verifyAndHandle(headers, event);
    return { received: true };
  }
}
