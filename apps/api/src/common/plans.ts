import type { PlanId } from '@pivoa/shared';

export interface PlanLimits {
  expensesPerCycle: number | null;
  goals: number | null;
  scansPerCycle: number;
  multiCurrency: boolean;
  csv: boolean;
  highPriority: boolean;
}

const OPEN_ACCESS: PlanLimits = {
  expensesPerCycle: null,
  goals: null,
  scansPerCycle: 1_000_000,
  multiCurrency: true,
  csv: true,
  highPriority: true,
};

/** Subscriptions are gone. Every account has full access. */
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: OPEN_ACCESS,
  plus: OPEN_ACCESS,
  pro: OPEN_ACCESS,
};

const ENTITLED = new Set(['active', 'trialing', 'past_due']);

export function effectivePlan(row: {
  plan?: string | null;
  subscription_status?: string | null;
  complimentary?: boolean | null;
  current_period_end?: string | null;
}): PlanId {
  const plan = row.plan === 'plus' || row.plan === 'pro' ? row.plan : 'free';
  if (plan === 'free') return 'free';
  if (row.complimentary) return plan;
  if (ENTITLED.has(row.subscription_status || '')) return plan;
  if (
    row.subscription_status === 'canceled' &&
    row.current_period_end &&
    new Date(row.current_period_end).getTime() > Date.now()
  ) {
    return plan;
  }
  return 'free';
}

export function isAdminEmail(email: string | null | undefined, allowlist: string | undefined): boolean {
  if (!email || !allowlist) return false;
  const normalized = email.trim().toLowerCase();
  return allowlist
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalized);
}
