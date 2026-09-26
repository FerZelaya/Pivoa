export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoalWithProgress extends SavingsGoal {
  percentage: number;
  remaining: number;
  monthlyRequired: number | null; // Monthly deposit needed to reach goal by target date
}

export interface CreateSavingsGoalDto {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  icon?: string;
  color?: string;
}

export interface UpdateSavingsGoalDto {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string | null;
  icon?: string;
  color?: string;
}

export interface DepositToGoalDto {
  amount: number;
}
