import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import type { AdminStats, AdminUserDetail, AdminUserSummary, PasswordResetResult } from '@pivoa/shared';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { Admin } from '../auth/decorators/index.js';
import { EntitlementsService } from '../billing/entitlements.service.js';
import { PLAN_LIMITS } from '../common/plans.js';
import { mapTicket } from '../tickets/tickets.mapper.js';
import { SetOnboardingDto } from './dto/admin.dto.js';

@Admin()
@Controller('admin')
export class AdminController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly entitlements: EntitlementsService,
    private readonly config: ConfigService,
  ) {}

  @Get('stats')
  async stats(): Promise<AdminStats> {
    const [{ count: users }, { count: openTickets }, { count: paid }, { count: pastDue }] = await Promise.all([
      this.supabase.from('users').select('id', { count: 'exact', head: true }),
      this.supabase.from('support_tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'pending']),
      this.supabase.from('users').select('id', { count: 'exact', head: true }).in('plan', ['plus', 'pro']),
      this.supabase.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'past_due'),
    ]);
    return {
      users: users || 0,
      openTickets: openTickets || 0,
      paid: paid || 0,
      pastDue: pastDue || 0,
    };
  }

  @Get('users')
  async users(
    @Query('search') search?: string,
    @Query('plan') plan?: string,
    @Query('onboarding') onboarding?: string,
    @Query('page') page = '1',
  ): Promise<{ data: AdminUserSummary[]; total: number }> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = 25;
    const embed = onboarding === 'yes' || onboarding === 'no' ? 'user_settings!inner' : 'user_settings';
    let query = this.supabase
      .from('users')
      .select(`*, ${embed}(onboarding_completed, currency, cycle_start_day, monthly_income_cap)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((pageNum - 1) * pageSize, pageNum * pageSize - 1);
    if (onboarding === 'yes' || onboarding === 'no') {
      query = query.eq('user_settings.onboarding_completed', onboarding === 'yes');
    }

    const term = search?.trim().replace(/[%,()*]/g, ' ');
    if (term) query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
    if (plan === 'free' || plan === 'plus' || plan === 'pro') query = query.eq('plan', plan);

    const { data, error, count } = await query;
    if (error) throw new BadRequestException(error.message);

    const summaries = await Promise.all((data || []).map((row) => this.toSummary(row)));
    return { data: summaries, total: count || summaries.length };
  }

  @Get('users/:id')
  async user(@Param('id') id: string): Promise<AdminUserDetail> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*, user_settings(onboarding_completed, currency, cycle_start_day, monthly_income_cap)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('User not found');

    const summary = await this.toSummary(data);
    const snap = await this.entitlements.snapshot(id);
    const [{ count: expenseCount }, { count: goalCount }, { count: budgetCount }, tickets] = await Promise.all([
      this.supabase.from('expenses').select('id', { count: 'exact', head: true }).eq('user_id', id),
      this.supabase.from('savings_goals').select('id', { count: 'exact', head: true }).eq('user_id', id),
      this.supabase.from('category_budgets').select('id', { count: 'exact', head: true }).eq('user_id', id),
      this.supabase.from('support_tickets').select('*').eq('user_id', id).order('updated_at', { ascending: false }).limit(5),
    ]);

    return {
      ...summary,
      paypalPayerId: data.paypal_payer_id,
      paypalSubscriptionId: data.paypal_subscription_id,
      receiptScansUsed: snap.row.receipt_scans_used,
      receiptScanLimit: PLAN_LIMITS[snap.plan].scansPerCycle,
      expenseCount: expenseCount || 0,
      goalCount: goalCount || 0,
      budgetCount: budgetCount || 0,
      recentTickets: (tickets.data || []).map((row) => mapTicket(row)),
    };
  }

  @Post('users/:id/password-reset')
  async passwordReset(@Param('id') id: string): Promise<PasswordResetResult> {
    const email = await this.emailOf(id);
    const origin = this.config.get<string>('WEB_ORIGIN', 'http://localhost:5173').replace(/\/$/, '');
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/recovery`,
    });
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }

  @Post('users/:id/confirm-email')
  async confirmEmail(@Param('id') id: string) {
    const { error } = await this.supabase.auth.admin.updateUserById(id, { email_confirm: true });
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }

  @Post('users/:id/ban')
  async ban(@Param('id') id: string) {
    const { error } = await this.supabase.auth.admin.updateUserById(id, { ban_duration: '876000h' });
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }

  @Post('users/:id/unban')
  async unban(@Param('id') id: string) {
    const { error } = await this.supabase.auth.admin.updateUserById(id, { ban_duration: 'none' });
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }

  @Post('users/:id/onboarding')
  async onboarding(@Param('id') id: string, @Body() dto: SetOnboardingDto) {
    const { error } = await this.supabase
      .from('user_settings')
      .update({ onboarding_completed: dto.completed })
      .eq('user_id', id);
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }

  private settingsOf(row: Record<string, unknown>) {
    const raw = row.user_settings as
      | { onboarding_completed?: boolean; currency?: string; cycle_start_day?: number; monthly_income_cap?: number }
      | Array<{ onboarding_completed?: boolean; currency?: string; cycle_start_day?: number; monthly_income_cap?: number }>
      | null;
    if (Array.isArray(raw)) return raw[0] || {};
    return raw || {};
  }

  private async toSummary(row: Record<string, unknown>): Promise<AdminUserSummary> {
    const id = row.id as string;
    const { data } = await this.supabase.auth.admin.getUserById(id);
    const authUser = data?.user;
    const settings = this.settingsOf(row);
    const providers = (authUser?.app_metadata?.providers as string[] | undefined) || [];
    return {
      id,
      email: (row.email as string) || authUser?.email || '',
      fullName: (row.full_name as string | null) ?? null,
      createdAt: row.created_at as string,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      providers,
      emailConfirmed: Boolean(authUser?.email_confirmed_at),
      bannedUntil: authUser?.banned_until ?? null,
      plan: (row.plan as AdminUserSummary['plan']) || 'free',
      subscriptionStatus: (row.subscription_status as AdminUserSummary['subscriptionStatus']) || 'none',
      currentPeriodEnd: (row.current_period_end as string | null) ?? null,
      complimentary: Boolean(row.complimentary),
      onboardingCompleted: Boolean(settings.onboarding_completed),
      currency: settings.currency || 'USD',
      cycleStartDay: Number(settings.cycle_start_day) || 1,
      monthlyIncomeCap: parseFloat(String(settings.monthly_income_cap ?? 0)) || 0,
    };
  }

  private async emailOf(id: string) {
    const { data, error } = await this.supabase.from('users').select('email').eq('id', id).maybeSingle();
    if (error || !data?.email) throw new NotFoundException('User not found');
    return data.email as string;
  }
}
