import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { PlanId } from '@pivoa/shared';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { getCycleWindow } from '../common/cycle.js';
import { effectivePlan, PLAN_LIMITS } from '../common/plans.js';

export interface AccountRow {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  subscription_status: string;
  current_period_end: string | null;
  complimentary: boolean;
  paypal_payer_id: string | null;
  paypal_subscription_id: string | null;
  receipt_scans_used: number;
  receipt_scans_cycle_start: string | null;
  created_at: string;
}

@Injectable()
export class EntitlementsService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async getUserRow(userId: string): Promise<AccountRow> {
    const { data, error } = await this.supabase
      .from('users')
      .select(
        'id, email, full_name, plan, subscription_status, current_period_end, complimentary, paypal_payer_id, paypal_subscription_id, receipt_scans_used, receipt_scans_cycle_start, created_at',
      )
      .eq('id', userId)
      .single();
    if (error || !data) {
      throw new ForbiddenException('Account not found');
    }
    return data as AccountRow;
  }

  planOf(row: AccountRow): PlanId {
    return effectivePlan(row);
  }

  async settingsFor(userId: string) {
    const { data } = await this.supabase
      .from('user_settings')
      .select('currency, cycle_start_day, onboarding_completed, monthly_income_cap')
      .eq('user_id', userId)
      .maybeSingle();
    return {
      currency: (data?.currency as string) || 'USD',
      cycleStartDay: Number(data?.cycle_start_day) || 1,
      onboardingCompleted: Boolean(data?.onboarding_completed),
      monthlyIncomeCap: parseFloat(String(data?.monthly_income_cap ?? 0)) || 0,
    };
  }

  private async syncScanCycle(row: AccountRow, cycleStartDay: number): Promise<AccountRow> {
    const window = getCycleWindow(cycleStartDay);
    if (row.receipt_scans_cycle_start === window.start) return row;
    const { data, error } = await this.supabase
      .from('users')
      .update({ receipt_scans_used: 0, receipt_scans_cycle_start: window.start })
      .eq('id', row.id)
      .select(
        'id, email, full_name, plan, subscription_status, current_period_end, complimentary, paypal_payer_id, paypal_subscription_id, receipt_scans_used, receipt_scans_cycle_start, created_at',
      )
      .single();
    if (error || !data) return { ...row, receipt_scans_used: 0, receipt_scans_cycle_start: window.start };
    return data as AccountRow;
  }

  async snapshot(userId: string) {
    const settings = await this.settingsFor(userId);
    let row = await this.getUserRow(userId);
    row = await this.syncScanCycle(row, settings.cycleStartDay);
    const plan = this.planOf(row);
    const limits = PLAN_LIMITS[plan];
    const window = getCycleWindow(settings.cycleStartDay);

    const { count: expensesThisCycle } = await this.supabase
      .from('expenses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', window.start)
      .lte('date', window.end);

    const { count: goalCount } = await this.supabase
      .from('savings_goals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      row,
      settings,
      plan,
      limits,
      expensesThisCycle: expensesThisCycle || 0,
      goalCount: goalCount || 0,
      window,
    };
  }

  async assertCanCreateExpense(userId: string, currency?: string, creating = true) {
    const snap = await this.snapshot(userId);
    if (
      creating &&
      snap.limits.expensesPerCycle != null &&
      snap.expensesThisCycle >= snap.limits.expensesPerCycle
    ) {
      throw new ForbiddenException(
        `Free includes ${snap.limits.expensesPerCycle} expenses per cycle. Upgrade to Plus for unlimited history.`,
      );
    }
    const code = (currency || snap.settings.currency).toUpperCase();
    if (!snap.limits.multiCurrency && code !== snap.settings.currency.toUpperCase()) {
      throw new ForbiddenException('Logging expenses in another currency is a Plus feature.');
    }
  }

  async assertCanCreateGoal(userId: string) {
    const snap = await this.snapshot(userId);
    if (snap.limits.goals != null && snap.goalCount >= snap.limits.goals) {
      throw new ForbiddenException('Free includes 1 savings goal. Upgrade to Plus for unlimited goals.');
    }
  }

  async assertCanChangeCurrency(_userId: string) {
    return;
  }

  async assertCanScan(userId: string) {
    const snap = await this.snapshot(userId);
    if (snap.limits.scansPerCycle <= 0) {
      throw new ForbiddenException('Receipt scanning is included with Plus.');
    }
    if (snap.row.receipt_scans_used >= snap.limits.scansPerCycle) {
      throw new ForbiddenException(
        `You have used ${snap.limits.scansPerCycle} receipt scans this cycle. Upgrade to Pro for a higher limit.`,
      );
    }
  }

  async recordScan(userId: string) {
    const snap = await this.snapshot(userId);
    await this.supabase
      .from('users')
      .update({ receipt_scans_used: snap.row.receipt_scans_used + 1 })
      .eq('id', userId);
  }
}
