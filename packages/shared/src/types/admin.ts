import type { PlanId, SubscriptionStatus } from './billing.js';
import type { SupportTicket } from './ticket.js';

export interface AdminStats {
  users: number;
  openTickets: number;
  paid: number;
  pastDue: number;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  providers: string[];
  emailConfirmed: boolean;
  bannedUntil: string | null;
  plan: PlanId;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
  complimentary: boolean;
  onboardingCompleted: boolean;
  currency: string;
  cycleStartDay: number;
  monthlyIncomeCap: number;
}

export interface AdminUserDetail extends AdminUserSummary {
  paypalPayerId: string | null;
  paypalSubscriptionId: string | null;
  receiptScansUsed: number;
  receiptScanLimit: number;
  expenseCount: number;
  goalCount: number;
  budgetCount: number;
  recentTickets: SupportTicket[];
}

export interface GrantPlanDto {
  plan: PlanId;
}

export interface SetOnboardingDto {
  completed: boolean;
}

export interface PasswordResetResult {
  ok: true;
}
