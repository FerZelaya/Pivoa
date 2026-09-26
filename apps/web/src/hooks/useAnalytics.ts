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

export function useSpendingTrend(options: { granularity?: 'day' | 'week'; from?: string; to?: string } = {}) {
  const { granularity = 'day', from, to } = options
  const params = new URLSearchParams()
  params.set('granularity', granularity)
  if (from) params.set('from', from)
  if (to) params.set('to', to)

  return useQuery({
    queryKey: ['analytics', 'trend', granularity, from, to],
    queryFn: () => api<TrendDataPoint[]>(`/analytics/trend?${params.toString()}`),
    enabled: Boolean(from && to),
  })
}
