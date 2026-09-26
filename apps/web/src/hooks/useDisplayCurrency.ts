import { useEffect } from 'react'
import { setDisplayCurrency } from '@/lib/format'
import { useSettings } from './useSettings'

export function useDisplayCurrency() {
  const { data: settings } = useSettings()
  useEffect(() => {
    if (settings?.currency) setDisplayCurrency(settings.currency)
  }, [settings?.currency])
  return settings?.currency ?? 'USD'
}
