import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient, type User } from '@supabase/supabase-js';
import type { SupportTicket, SupportTicketDetail } from '@pivoa/shared';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { Admin, CurrentUser } from '../auth/decorators/index.js';
import { EntitlementsService } from '../billing/entitlements.service.js';
import { CreateTicketDto, ReplyTicketDto, UpdateTicketDto } from './dto/ticket.dto.js';
import { mapMessage, mapTicket } from './tickets.mapper.js';

@Controller()
export class TicketsController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly entitlements: EntitlementsService,
  ) {}

  @Get('tickets')
  async mine(@CurrentUser() user: User): Promise<SupportTicket[]> {
    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return (data || []).map((row) => mapTicket(row));
  }

  @Post('tickets')
  async create(@CurrentUser() user: User, @Body() dto: CreateTicketDto): Promise<SupportTicket> {
    const snap = await this.entitlements.snapshot(user.id);
    const priority = dto.priority === 'high' && snap.limits.highPriority ? 'high' : dto.priority === 'low' ? 'low' : 'normal';
    const { data, error } = await this.supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject: dto.subject.trim(),
        category: dto.category,
        priority,
        body: dto.body.trim(),
      })
      .select()
      .single();
    if (error || !data) throw new BadRequestException(error?.message || 'Could not create ticket');
    return mapTicket(data);
  }

  @Get('tickets/:id')
  async one(@CurrentUser() user: User, @Param('id') id: string): Promise<SupportTicketDetail> {
    return this.load(id, user.id);
  }

  @Post('tickets/:id/messages')
  async reply(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: ReplyTicketDto): Promise<SupportTicketDetail> {
    const ticket = await this.load(id, user.id);
    if (ticket.status === 'closed') throw new BadRequestException('This ticket is closed');
    const { error } = await this.supabase.from('support_ticket_messages').insert({
      ticket_id: id,
      author_id: user.id,
      author_role: 'user',
      body: dto.body.trim(),
    });
    if (error) throw new BadRequestException(error.message);
    await this.supabase.from('support_tickets').update({ status: 'open' }).eq('id', id);
    return this.load(id, user.id);
  }

  @Admin()
  @Get('admin/tickets')
  async inbox(
    @Query('status') status?: string,
    @Query('category') category?: string,
  ): Promise<SupportTicket[]> {
    let query = this.supabase
      .from('support_tickets')
      .select('*, users(email, full_name)')
      .order('updated_at', { ascending: false })
      .limit(200);
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return (data || []).map((row) => {
      const owner = row.users as { email?: string; full_name?: string | null } | null;
      return mapTicket(row, owner ?? undefined);
    });
  }

  @Admin()
  @Get('admin/tickets/:id')
  async adminOne(@Param('id') id: string): Promise<SupportTicketDetail> {
    return this.load(id);
  }

  @Admin()
  @Patch('admin/tickets/:id')
  async adminUpdate(
    @CurrentUser() admin: User,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ): Promise<SupportTicketDetail> {
    await this.load(id);
    if (dto.status) {
      const { error } = await this.supabase.from('support_tickets').update({ status: dto.status }).eq('id', id);
      if (error) throw new BadRequestException(error.message);
    }
    if (dto.reply?.trim()) {
      const { error } = await this.supabase.from('support_ticket_messages').insert({
        ticket_id: id,
        author_id: admin.id,
        author_role: 'admin',
        body: dto.reply.trim(),
      });
      if (error) throw new BadRequestException(error.message);
      if (!dto.status) {
        await this.supabase.from('support_tickets').update({ status: 'pending' }).eq('id', id);
      }
    }
    return this.load(id);
  }

  private async load(id: string, ownerId?: string): Promise<SupportTicketDetail> {
    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*, users(email, full_name)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data || (ownerId && data.user_id !== ownerId)) throw new NotFoundException('Ticket not found');
    const { data: messages, error: messageError } = await this.supabase
      .from('support_ticket_messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });
    if (messageError) throw new BadRequestException(messageError.message);
    const owner = data.users as { email?: string; full_name?: string | null } | null;
    return { ...mapTicket(data, owner ?? undefined), messages: (messages || []).map(mapMessage) };
  }
}
