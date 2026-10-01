export type CardRewardsType = 'none' | 'cashback' | 'miles' | 'points';

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  statementCloseDay: number;
  paymentDueDay: number;
  currency: string;
  rewardsType: CardRewardsType;
  rewardsRate: number;
  rewardsLabel: string | null;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCardSummary extends CreditCard {
  balance: number;
  nextClose: string;
  nextDue: string;
  estimatedRewards: number;
}

export interface CreditCardCharge {
  id: string;
  cardId: string;
  amount: number;
  currency: string;
  baseAmount: number;
  fxRate: number;
  categoryId: string | null;
  vendor: string | null;
  date: string;
  notes: string | null;
  statementPeriodStart: string;
  statementPeriodEnd: string;
  createdAt: string;
}

export interface CreditCardPayment {
  id: string;
  cardId: string;
  amount: number;
  currency: string;
  baseAmount: number;
  paidAt: string;
  expenseId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateCreditCardDto {
  name: string;
  statementCloseDay: number;
  paymentDueDay: number;
  currency?: string;
  rewardsType?: CardRewardsType;
  rewardsRate?: number;
  rewardsLabel?: string;
  icon?: string;
  color?: string;
}

export interface UpdateCreditCardDto {
  name?: string;
  statementCloseDay?: number;
  paymentDueDay?: number;
  currency?: string;
  rewardsType?: CardRewardsType;
  rewardsRate?: number;
  rewardsLabel?: string | null;
  icon?: string;
  color?: string;
}

export interface CreateCardChargeDto {
  amount: number;
  currency?: string;
  categoryId?: string;
  vendor?: string;
  date: string;
  notes?: string;
}

export interface RecordCardPaymentDto {
  amount: number;
  currency?: string;
  paidAt?: string;
  notes?: string;
}
