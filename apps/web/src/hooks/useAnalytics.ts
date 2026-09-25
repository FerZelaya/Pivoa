import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface SpendingSummary {
  totalSpent: number
  transactionCount: number
  averageTransaction: number
  previousMonthTotal: number
  changePercent: number
}

export interface CategorySpending {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  total: number
  count: number
  percentage: number
}

export interface TrendDataPoint {
  date: string
  total: number
  count: number
}

export function useSpendingSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => api<SpendingSummary>('/analytics/summary'),
  })
}

export function useCategorySpending() {
  return useQuery({
    queryKey: ['analytics', 'by-category'],
    queryFn: () => api<CategorySpending[]>('/analytics/by-category'),
  })
}

export function useSpendingTrend(granularity: 'day' | 'week' = 'day', days = 30) {
  return useQuery({
    queryKey: ['analytics', 'trend', granularity, days],
    queryFn: () => api<TrendDataPoint[]>(`/analytics/trend?granularity=${granularity}&days=${days}`),
  })
}
