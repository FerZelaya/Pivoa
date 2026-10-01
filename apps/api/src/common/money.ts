import type { Expense, ExpenseWithCategory, UserSettings } from '@pivoa/shared';

export function mapSettings(row: Record<string, unknown>): UserSettings {
  const language = row.language === 'es' ? 'es' : 'en';
  return {
    userId: row.user_id as string,
    monthlyIncomeCap: parseFloat(String(row.monthly_income_cap ?? 0)) || 0,
    currency: (row.currency as string) || 'USD',
    cycleStartDay: Number(row.cycle_start_day) || 1,
    language,
    onboardingCompleted: Boolean(row.onboarding_completed),
    tutorialCompleted: Boolean(row.tutorial_completed),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapExpense(row: Record<string, unknown>): Expense {
  const amount = parseFloat(String(row.amount ?? 0)) || 0;
  const baseAmount = row.base_amount == null ? amount : parseFloat(String(row.base_amount)) || 0;
  return {
    id: row.id as string,
    userId: row.user_id as string,
    amount,
    currency: (row.currency as string) || 'USD',
    baseAmount,
    fxRate: parseFloat(String(row.fx_rate ?? 1)) || 1,
    categoryId: row.category_id as string,
    vendor: (row.vendor as string | null) ?? null,
    date: row.date as string,
    receiptImageUrl: (row.receipt_image_url as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapExpenseWithCategory(row: Record<string, unknown>): ExpenseWithCategory {
  return {
    ...mapExpense(row),
    category: row.category as ExpenseWithCategory['category'],
  };
}

export function baseAmountOf(row: { base_amount?: unknown; amount?: unknown }): number {
  if (row.base_amount != null && row.base_amount !== '') {
    return parseFloat(String(row.base_amount)) || 0;
  }
  return parseFloat(String(row.amount ?? 0)) || 0;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
