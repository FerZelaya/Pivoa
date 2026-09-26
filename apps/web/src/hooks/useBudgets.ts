import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  BudgetSummary,
  CategoryBudget,
  CategoryBudgetWithSpent,
  CreateCategoryBudgetDto,
  UpdateCategoryBudgetDto,
} from '@pivoa/shared'

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets', 'list'],
    queryFn: () => api<CategoryBudgetWithSpent[]>('/budgets'),
  })
}

export function useBudgetSummary() {
  return useQuery({
    queryKey: ['budgets', 'summary'],
    queryFn: () => api<BudgetSummary>('/budgets/summary'),
  })
}

function useInvalidateBudgets() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
    queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] })
  }
}

export function useCreateBudget() {
  const onSuccess = useInvalidateBudgets()
  return useMutation({
    mutationFn: (data: CreateCategoryBudgetDto) => api<CategoryBudget>('/budgets', { method: 'POST', body: data }),
    onSuccess,
  })
}

export function useUpdateBudget() {
  const onSuccess = useInvalidateBudgets()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryBudgetDto }) =>
      api<CategoryBudget>(`/budgets/${id}`, { method: 'PATCH', body: data }),
    onSuccess,
  })
}

export function useDeleteBudget() {
  const onSuccess = useInvalidateBudgets()
  return useMutation({
    mutationFn: (id: string) => api<{ success: boolean }>(`/budgets/${id}`, { method: 'DELETE' }),
    onSuccess,
  })
}
