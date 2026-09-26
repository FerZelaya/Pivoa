import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Expense, ExpenseWithCategory, PaginatedResponse, CreateExpenseDto, UpdateExpenseDto } from '@pivoa/shared'

interface UseExpensesOptions {
  page?: number
  pageSize?: number
  categoryId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const { page = 1, pageSize = 20, categoryId, startDate, endDate, search } = options

  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))
  if (categoryId) params.set('categoryId', categoryId)
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  if (search) params.set('search', search)

  return useQuery({
    queryKey: ['expenses', { page, pageSize, categoryId, startDate, endDate, search }],
    queryFn: () => api<PaginatedResponse<ExpenseWithCategory>>(`/expenses?${params.toString()}`),
    placeholderData: keepPreviousData,
  })
}

function useInvalidateSpending() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
  }
}

export function useCreateExpense() {
  const onSuccess = useInvalidateSpending()
  return useMutation({
    mutationFn: (data: CreateExpenseDto) => api<Expense>('/expenses', { method: 'POST', body: data }),
    onSuccess,
  })
}

export function useUpdateExpense() {
  const onSuccess = useInvalidateSpending()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseDto }) =>
      api<Expense>(`/expenses/${id}`, { method: 'PATCH', body: data }),
    onSuccess,
  })
}

export function useDeleteExpense() {
  const onSuccess = useInvalidateSpending()
  return useMutation({
    mutationFn: (id: string) => api<{ success: boolean }>(`/expenses/${id}`, { method: 'DELETE' }),
    onSuccess,
  })
}
