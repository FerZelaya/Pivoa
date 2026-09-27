export type TicketCategory = 'bug' | 'account' | 'billing' | 'other';
export type TicketPriority = 'low' | 'normal' | 'high';
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketAuthorRole = 'user' | 'admin';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  body: string;
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
  userName?: string | null;
}

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorRole: TicketAuthorRole;
  body: string;
  createdAt: string;
}

export interface SupportTicketDetail extends SupportTicket {
  messages: SupportTicketMessage[];
}

export interface CreateTicketDto {
  subject: string;
  category: TicketCategory;
  body: string;
  priority?: TicketPriority;
}

export interface ReplyTicketDto {
  body: string;
}

export interface UpdateTicketDto {
  status?: TicketStatus;
  reply?: string;
}
