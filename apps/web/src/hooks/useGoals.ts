import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  CreateSavingsGoalDto,
  SavingsGoal,
  SavingsGoalWithProgress,
  UpdateSavingsGoalDto,
} from '@pivoa/shared'

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => api<SavingsGoalWithProgress[]>('/goals'),
  })
}

function useInvalidateGoals() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['goals'] })
    queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] })
  }
}

export function useCreateGoal() {
  const onSuccess = useInvalidateGoals()
  return useMutation({
    mutationFn: (data: CreateSavingsGoalDto) => api<SavingsGoal>('/goals', { method: 'POST', body: data }),
    onSuccess,
  })
}

export function useUpdateGoal() {
  const onSuccess = useInvalidateGoals()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavingsGoalDto }) =>
      api<SavingsGoal>(`/goals/${id}`, { method: 'PATCH', body: data }),
    onSuccess,
  })
}

export function useDepositToGoal() {
  const onSuccess = useInvalidateGoals()
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api<SavingsGoal>(`/goals/${id}/deposit`, { method: 'POST', body: { amount } }),
    onSuccess,
  })
}

export function useDeleteGoal() {
  const onSuccess = useInvalidateGoals()
  return useMutation({
    mutationFn: (id: string) => api<{ success: boolean }>(`/goals/${id}`, { method: 'DELETE' }),
    onSuccess,
  })
}
