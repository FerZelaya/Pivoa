export interface Expense {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  categoryId: string;
  vendor: string | null;
  date: string;
  receiptImageUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  amount: number;
  currency?: string;
  categoryId: string;
  vendor?: string;
  date: string;
  receiptImageUrl?: string;
  notes?: string;
}

export interface UpdateExpenseDto {
  amount?: number;
  currency?: string;
  categoryId?: string;
  vendor?: string;
  date?: string;
  receiptImageUrl?: string;
  notes?: string;
}

export interface ExpenseWithCategory extends Expense {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}
