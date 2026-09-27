import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AdminStats, AdminUserDetail, AdminUserSummary, GrantPlanDto, PasswordResetResult, SetOnboardingDto } from '@pivoa/shared'
import { api } from '@/lib/api'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api<AdminStats>('/admin/stats'),
  })
}

export function useAdminUsers(filters: { search?: string; plan?: string; onboarding?: string; page?: number }) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.plan) params.set('plan', filters.plan)
  if (filters.onboarding) params.set('onboarding', filters.onboarding)
  if (filters.page) params.set('page', String(filters.page))
  const qs = params.toString()
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => api<{ data: AdminUserSummary[]; total: number }>(`/admin/users${qs ? `?${qs}` : ''}`),
  })
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => api<AdminUserDetail>(`/admin/users/${id}`),
    enabled: Boolean(id),
  })
}

function useAdminAction(id: string, path: string, method: 'POST' = 'POST') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body?: unknown) => api(`/admin/users/${id}/${path}`, { method, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useAdminPasswordReset(id: string) {
  return useMutation({
    mutationFn: () => api<PasswordResetResult>(`/admin/users/${id}/password-reset`, { method: 'POST' }),
  })
}

export function useAdminConfirmEmail(id: string) {
  return useAdminAction(id, 'confirm-email')
}

export function useAdminBan(id: string) {
  return useAdminAction(id, 'ban')
}

export function useAdminUnban(id: string) {
  return useAdminAction(id, 'unban')
}

export function useAdminOnboarding(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: SetOnboardingDto) => api(`/admin/users/${id}/onboarding`, { method: 'POST', body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminGrantPlan(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: GrantPlanDto) => api(`/admin/users/${id}/plan`, { method: 'POST', body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminCancelSubscription(id: string) {
  return useAdminAction(id, 'cancel-subscription')
}
