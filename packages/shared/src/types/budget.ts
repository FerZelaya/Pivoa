export interface CategoryBudget {
  id: string;
  userId: string;
  categoryId: string;
  monthlyLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudgetWithCategory extends CategoryBudget {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export interface CategoryBudgetWithSpent extends CategoryBudgetWithCategory {
  spent: number;
  percentage: number;
  remaining: number;
}

export interface CreateCategoryBudgetDto {
  categoryId: string;
  monthlyLimit: number;
}

export interface UpdateCategoryBudgetDto {
  monthlyLimit: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  percentage: number;
  remaining: number;
  daysRemaining: number;
  dailyBudget: number;
  projectedSpend: number;
  isOverBudget: boolean;
}
