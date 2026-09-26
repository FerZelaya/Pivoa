import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ChangeCurrencyDto, ChangeCurrencyResult, CompleteOnboardingDto, UpdateSettingsDto, UserSettings } from '@pivoa/shared'
import { setDisplayCurrency } from '@/lib/format'
import { useAuth } from '@/contexts/AuthContext'

export function useSettings() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['settings', user?.id],
    queryFn: () => api<UserSettings>('/settings'),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 10,
    retry: false,
  })
}

function useInvalidateMoney() {
  const queryClient = useQueryClient()
  return (settings: UserSettings) => {
    queryClient.setQueryData(['settings', settings.userId], settings)
    if (settings.currency) setDisplayCurrency(settings.currency)
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
    queryClient.invalidateQueries({ queryKey: ['goals'] })
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: ['currency'] })
  }
}

export function useChangeCurrency() {
  const onSuccess = useInvalidateMoney()
  return useMutation({
    mutationFn: (data: ChangeCurrencyDto) =>
      api<ChangeCurrencyResult>('/settings/change-currency', { method: 'POST', body: data }),
    onSuccess: (result) => onSuccess(result.settings),
  })
}

export function useUpdateSettings() {
  const onSuccess = useInvalidateMoney()
  return useMutation({
    mutationFn: (data: UpdateSettingsDto) => api<UserSettings>('/settings', { method: 'PATCH', body: data }),
    onSuccess,
  })
}

export function useCompleteOnboarding() {
  const onSuccess = useInvalidateMoney()
  return useMutation({
    mutationFn: (data: CompleteOnboardingDto) =>
      api<UserSettings>('/settings/complete-onboarding', { method: 'POST', body: data }),
    onSuccess,
  })
}
