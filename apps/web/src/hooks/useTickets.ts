import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateTicketDto, ReplyTicketDto, SupportTicket, SupportTicketDetail, UpdateTicketDto } from '@pivoa/shared'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export function useMyTickets() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['tickets', user?.id],
    queryFn: () => api<SupportTicket[]>('/tickets'),
    enabled: Boolean(user?.id),
  })
}

export function useTicket(id: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['tickets', user?.id, id],
    queryFn: () => api<SupportTicketDetail>(`/tickets/${id}`),
    enabled: Boolean(user?.id && id),
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTicketDto) => api<SupportTicket>('/tickets', { method: 'POST', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  })
}

export function useReplyTicket(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ReplyTicketDto) => api<SupportTicketDetail>(`/tickets/${id}/messages`, { method: 'POST', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  })
}

export function useAdminTickets(status?: string, category?: string) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (category) params.set('category', category)
  const qs = params.toString()
  return useQuery({
    queryKey: ['admin', 'tickets', status ?? '', category ?? ''],
    queryFn: () => api<SupportTicket[]>(`/admin/tickets${qs ? `?${qs}` : ''}`),
  })
}

export function useAdminTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'tickets', id],
    queryFn: () => api<SupportTicketDetail>(`/admin/tickets/${id}`),
    enabled: Boolean(id),
  })
}

export function useUpdateAdminTicket(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTicketDto) => api<SupportTicketDetail>(`/admin/tickets/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] }),
  })
}
