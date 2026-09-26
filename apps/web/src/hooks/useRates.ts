import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ExchangeRates } from '@pivoa/shared'
import { useSettings } from './useSettings'
import { normalizeCurrency } from '@/lib/format'

export function useRates(base?: string) {
  const { data: settings } = useSettings()
  const code = normalizeCurrency(base ?? settings?.currency ?? 'USD')

  return useQuery({
    queryKey: ['currency', 'rates', code],
    queryFn: () => api<ExchangeRates>(`/currency/rates?base=${code}`),
    staleTime: 1000 * 60 * 60,
    retry: 1,
  })
}

export function convertWithRates(amount: number, from: string, to: string, rates?: ExchangeRates | null) {
  const source = normalizeCurrency(from)
  const target = normalizeCurrency(to)
  if (source === target) return amount
  if (!rates) return null
  if (normalizeCurrency(rates.base) === source) {
    const rate = rates.rates[target]
    return rate ? amount * rate : null
  }
  if (normalizeCurrency(rates.base) === target) {
    const rate = rates.rates[source]
    return rate ? amount / rate : null
  }
  const fromRate = rates.rates[source]
  const toRate = rates.rates[target]
  if (!fromRate || !toRate) return null
  return (amount / fromRate) * toRate
}
