export type PlanId = 'free' | 'plus' | 'pro';

export type SubscriptionStatus =
  | 'none'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

export type BillingInterval = 'month' | 'year';

export interface MeResponse {
  id: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean;
  plan: PlanId;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
  complimentary: boolean;
  receiptScansUsed: number;
  receiptScanLimit: number;
  expensesThisCycle: number;
  expenseLimit: number | null;
  goalCount: number;
  goalLimit: number | null;
  multiCurrency: boolean;
  csvExport: boolean;
  highPriorityTickets: boolean;
}

export interface CheckoutDto {
  plan: Exclude<PlanId, 'free'>;
  interval: BillingInterval;
}

export interface CheckoutResult {
  url: string;
}

export interface SyncBillingDto {
  subscriptionId: string;
}
