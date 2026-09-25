import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Expense, ExpenseWithCategory, PaginatedResponse, CreateExpenseDto, UpdateExpenseDto } from '@pivoa/shared'

interface UseExpensesOptions {
  page?: number
  pageSize?: number
  categoryId?: string
  startDate?: string
  endDate?: string
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const { page = 1, pageSize = 20, categoryId, startDate, endDate } = options

  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))
  if (categoryId) params.set('categoryId', categoryId)
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)

  return useQuery({
    queryKey: ['expenses', { page, pageSize, categoryId, startDate, endDate }],
    queryFn: () => api<PaginatedResponse<ExpenseWithCategory>>(`/expenses?${params.toString()}`),
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseDto) =>
      api<Expense>('/expenses', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseDto }) =>
      api<Expense>(`/expenses/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api<{ success: boolean }>(`/expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}
