import { useQuery } from '@tanstack/react-query'
import type { MeResponse } from '@pivoa/shared'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export function useMe() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['me', user?.id],
    queryFn: () => api<MeResponse>('/me'),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60,
  })
}
