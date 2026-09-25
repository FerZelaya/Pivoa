import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ParsedReceipt {
  amount: number
  vendor: string | null
  date: string | null
  suggestedCategory: string | null
  imageUrl: string
}

export function useScanReceipt() {
  return useMutation({
    mutationFn: async (file: File): Promise<ParsedReceipt> => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/receipts/scan', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to scan receipt' }))
        throw new Error(error.message || 'Failed to scan receipt')
      }

      return response.json()
    },
  })
}
