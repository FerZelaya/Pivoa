import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateCardChargeDto,
  CreateCreditCardDto,
  CreditCardCharge,
  CreditCardPayment,
  CreditCardSummary,
  RecordCardPaymentDto,
  UpdateCreditCardDto,
} from '@pivoa/shared'
import { api } from '@/lib/api'

export function useCreditCards() {
  return useQuery({
    queryKey: ['credit-cards'],
    queryFn: () => api<CreditCardSummary[]>('/credit-cards'),
  })
}

function useInvalidateCards(alsoExpenses = false) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
    if (alsoExpenses) {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    }
  }
}

export function useCreateCreditCard() {
  const onSuccess = useInvalidateCards()
  return useMutation({
    mutationFn: (data: CreateCreditCardDto) => api<CreditCardSummary>('/credit-cards', { method: 'POST', body: data }),
    onSuccess,
  })
}

export function useUpdateCreditCard() {
  const onSuccess = useInvalidateCards()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCreditCardDto }) =>
      api<CreditCardSummary>(`/credit-cards/${id}`, { method: 'PATCH', body: data }),
    onSuccess,
  })
}

export function useDeleteCreditCard() {
  const onSuccess = useInvalidateCards()
  return useMutation({
    mutationFn: (id: string) => api(`/credit-cards/${id}`, { method: 'DELETE' }),
    onSuccess,
  })
}

export function useCreateCardCharge() {
  const onSuccess = useInvalidateCards()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCardChargeDto }) =>
      api<CreditCardCharge>(`/credit-cards/${id}/charges`, { method: 'POST', body: data }),
    onSuccess,
  })
}

export function useRecordCardPayment() {
  const onSuccess = useInvalidateCards(true)
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordCardPaymentDto }) =>
      api<CreditCardPayment>(`/credit-cards/${id}/payments`, { method: 'POST', body: data }),
    onSuccess,
  })
}
