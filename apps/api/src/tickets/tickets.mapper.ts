import type { SupportTicket, SupportTicketMessage } from '@pivoa/shared';

export function mapTicket(row: Record<string, unknown>, user?: { email?: string; full_name?: string | null }): SupportTicket {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    subject: row.subject as string,
    category: row.category as SupportTicket['category'],
    priority: row.priority as SupportTicket['priority'],
    status: row.status as SupportTicket['status'],
    body: row.body as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    userEmail: user?.email,
    userName: user?.full_name,
  };
}

export function mapMessage(row: Record<string, unknown>): SupportTicketMessage {
  return {
    id: row.id as string,
    ticketId: row.ticket_id as string,
    authorId: row.author_id as string,
    authorRole: row.author_role as SupportTicketMessage['authorRole'],
    body: row.body as string,
    createdAt: row.created_at as string,
  };
}
