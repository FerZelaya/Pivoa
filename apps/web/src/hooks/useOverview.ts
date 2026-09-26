import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface OverviewMetrics {
  totalBalance: number
  monthlyIncome: number
  monthlySpent: number
  netSavings: number
  savingsRate: number
  budgetUsed: number
  budgetRemaining: number
  budgetPercentage: number
  daysInMonth: number
  daysRemaining: number
  dailyBudget: number
  projectedMonthEnd: number
  isOverBudget: boolean
  changeFromLastMonth: number
  cycleStart: string
  cycleEnd: string
  currency: string
}

export function useOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api<OverviewMetrics>('/analytics/overview'),
  })
}
