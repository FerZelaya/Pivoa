import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CheckoutDto, CheckoutResult } from '@pivoa/shared'
import { api } from '@/lib/api'

export function useCheckout() {
  return useMutation({
    mutationFn: (data: CheckoutDto) => api<CheckoutResult>('/billing/checkout', { method: 'POST', body: data }),
    onSuccess: (result) => {
      window.location.href = result.url
    },
  })
}

export function useSyncBilling() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subscriptionId: string) => api('/billing/sync', { method: 'POST', body: { subscriptionId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useCancelPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api('/billing/cancel', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useRefreshBilling() {
  const queryClient = useQueryClient()
  return useCallback(() => queryClient.invalidateQueries({ queryKey: ['me'] }), [queryClient])
}
