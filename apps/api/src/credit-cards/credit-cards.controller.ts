import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type {
  CreditCardCharge,
  CreditCardPayment,
  CreditCardSummary,
} from '@pivoa/shared';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { CurrentUser } from '../auth/decorators/index.js';
import { CurrencyService } from '../currency/currency.service.js';
import { roundMoney } from '../common/money.js';
import {
  CreateCardChargeDto,
  CreateCreditCardDto,
  RecordCardPaymentDto,
  UpdateCreditCardDto,
} from './dto/credit-card.dto.js';
import { nextCloseDate, nextDueDate, statementWindow } from './statement.js';

const PAYMENT_CATEGORY = 'Credit card payment';

@Controller('credit-cards')
export class CreditCardsController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly currency: CurrencyService,
  ) {}

  @Get()
  async list(@CurrentUser() user: User): Promise<CreditCardSummary[]> {
    const cards = await this.cardsOf(user.id);
    return Promise.all(cards.map((card) => this.summarize(card)));
  }

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateCreditCardDto): Promise<CreditCardSummary> {
    const base = await this.baseCurrency(user.id);
    const { data, error } = await this.supabase
      .from('credit_cards')
      .insert({
        user_id: user.id,
        name: dto.name.trim(),
        statement_close_day: dto.statementCloseDay,
        payment_due_day: dto.paymentDueDay,
        currency: this.currency.normalize(dto.currency || base),
        rewards_type: dto.rewardsType ?? 'none',
        rewards_rate: dto.rewardsRate ?? 0,
        rewards_label: dto.rewardsLabel?.trim() || null,
        icon: dto.icon || 'credit_card',
        color: dto.color || '#0f766e',
      })
      .select('*')
      .single();
    if (error || !data) throw new BadRequestException(error?.message || 'Could not create card');
    return this.summarize(data);
  }

  @Get(':id')
  async one(@CurrentUser() user: User, @Param('id') id: string): Promise<CreditCardSummary> {
    return this.summarize(await this.cardOf(user.id, id));
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCreditCardDto,
  ): Promise<CreditCardSummary> {
    await this.cardOf(user.id, id);
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch.name = dto.name.trim();
    if (dto.statementCloseDay !== undefined) patch.statement_close_day = dto.statementCloseDay;
    if (dto.paymentDueDay !== undefined) patch.payment_due_day = dto.paymentDueDay;
    if (dto.currency !== undefined) patch.currency = this.currency.normalize(dto.currency);
    if (dto.rewardsType !== undefined) patch.rewards_type = dto.rewardsType;
    if (dto.rewardsRate !== undefined) patch.rewards_rate = dto.rewardsRate;
    if (dto.rewardsLabel !== undefined) patch.rewards_label = dto.rewardsLabel?.trim() || null;
    if (dto.icon !== undefined) patch.icon = dto.icon;
    if (dto.color !== undefined) patch.color = dto.color;
    const { data, error } = await this.supabase.from('credit_cards').update(patch).eq('id', id).select('*').single();
    if (error || !data) throw new BadRequestException(error?.message || 'Could not update card');
    return this.summarize(data);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.cardOf(user.id, id);
    const { error } = await this.supabase.from('credit_cards').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }

  @Get(':id/charges')
  async charges(@CurrentUser() user: User, @Param('id') id: string): Promise<CreditCardCharge[]> {
    await this.cardOf(user.id, id);
    const { data, error } = await this.supabase
      .from('credit_card_charges')
      .select('*')
      .eq('card_id', id)
      .order('date', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return (data || []).map(mapCharge);
  }

  @Post(':id/charges')
  async addCharge(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateCardChargeDto,
  ): Promise<CreditCardCharge> {
    const card = await this.cardOf(user.id, id);
    const base = await this.baseCurrency(user.id);
    const currency = this.currency.normalize(dto.currency || card.currency);
    const baseAmount = await this.currency.convert(dto.amount, currency, base);
    const window = statementWindow(card.statement_close_day, dto.date.slice(0, 10));
    const { data, error } = await this.supabase
      .from('credit_card_charges')
      .insert({
        card_id: id,
        amount: dto.amount,
        currency,
        base_amount: baseAmount,
        fx_rate: dto.amount > 0 ? baseAmount / dto.amount : 1,
        category_id: dto.categoryId || null,
        vendor: dto.vendor?.trim() || null,
        date: dto.date.slice(0, 10),
        notes: dto.notes?.trim() || null,
        statement_period_start: window.start,
        statement_period_end: window.end,
      })
      .select('*')
      .single();
    if (error || !data) throw new BadRequestException(error?.message || 'Could not add charge');
    return mapCharge(data);
  }

  @Delete(':id/charges/:chargeId')
  async removeCharge(@CurrentUser() user: User, @Param('id') id: string, @Param('chargeId') chargeId: string) {
    await this.cardOf(user.id, id);
    const { error } = await this.supabase.from('credit_card_charges').delete().eq('id', chargeId).eq('card_id', id);
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }

  @Get(':id/payments')
  async payments(@CurrentUser() user: User, @Param('id') id: string): Promise<CreditCardPayment[]> {
    await this.cardOf(user.id, id);
    const { data, error } = await this.supabase
      .from('credit_card_payments')
      .select('*')
      .eq('card_id', id)
      .order('paid_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return (data || []).map(mapPayment);
  }

  @Post(':id/payments')
  async pay(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: RecordCardPaymentDto,
  ): Promise<CreditCardPayment> {
    const card = await this.cardOf(user.id, id);
    const summary = await this.summarize(card);
    const base = await this.baseCurrency(user.id);
    const currency = this.currency.normalize(dto.currency || card.currency);
    const baseAmount = await this.currency.convert(dto.amount, currency, base);
    if (baseAmount > summary.balance + 0.009) {
      throw new BadRequestException('Payment is larger than the card balance');
    }
    const paidAt = (dto.paidAt || summary.nextDue).slice(0, 10);
    const categoryId = await this.paymentCategoryId();

    const { data: expense, error: expenseError } = await this.supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: dto.amount,
        currency,
        base_amount: baseAmount,
        fx_rate: dto.amount > 0 ? baseAmount / dto.amount : 1,
        category_id: categoryId,
        vendor: card.name,
        date: paidAt,
        notes: dto.notes?.trim() || `Payment for ${card.name}`,
      })
      .select('id')
      .single();
    if (expenseError || !expense) {
      throw new BadRequestException(expenseError?.message || 'Could not post the payment expense');
    }

    const { data, error } = await this.supabase
      .from('credit_card_payments')
      .insert({
        card_id: id,
        amount: dto.amount,
        currency,
        base_amount: baseAmount,
        paid_at: paidAt,
        expense_id: expense.id,
        notes: dto.notes?.trim() || null,
      })
      .select('*')
      .single();
    if (error || !data) throw new BadRequestException(error?.message || 'Could not record payment');
    return mapPayment(data);
  }


  private async cardsOf(userId: string) {
    const { data, error } = await this.supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  private async cardOf(userId: string, id: string) {
    const { data, error } = await this.supabase.from('credit_cards').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Card not found');
    return data;
  }

  private async baseCurrency(userId: string) {
    const { data } = await this.supabase.from('user_settings').select('currency').eq('user_id', userId).maybeSingle();
    return this.currency.normalize((data?.currency as string) || 'USD');
  }

  private async paymentCategoryId() {
    const { data } = await this.supabase
      .from('categories')
      .select('id')
      .is('user_id', null)
      .eq('name', PAYMENT_CATEGORY)
      .maybeSingle();
    if (!data?.id) throw new BadRequestException('Credit card payment category is missing');
    return data.id as string;
  }

  private async summarize(row: Record<string, unknown>): Promise<CreditCardSummary> {
    const id = row.id as string;
    const [{ data: charges }, { data: payments }] = await Promise.all([
      this.supabase.from('credit_card_charges').select('base_amount').eq('card_id', id),
      this.supabase.from('credit_card_payments').select('base_amount').eq('card_id', id),
    ]);
    const charged = (charges || []).reduce((sum, item) => sum + (parseFloat(String(item.base_amount)) || 0), 0);
    const paid = (payments || []).reduce((sum, item) => sum + (parseFloat(String(item.base_amount)) || 0), 0);
    const balance = roundMoney(Math.max(0, charged - paid));
    const closeDay = Number(row.statement_close_day);
    const dueDay = Number(row.payment_due_day);
    const nextClose = nextCloseDate(closeDay);
    const rate = parseFloat(String(row.rewards_rate ?? 0)) || 0;
    return {
      id,
      userId: row.user_id as string,
      name: row.name as string,
      statementCloseDay: closeDay,
      paymentDueDay: dueDay,
      currency: row.currency as string,
      rewardsType: row.rewards_type as CreditCardSummary['rewardsType'],
      rewardsRate: rate,
      rewardsLabel: (row.rewards_label as string | null) ?? null,
      icon: row.icon as string,
      color: row.color as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      balance,
      nextClose,
      nextDue: nextDueDate(closeDay, dueDay),
      estimatedRewards: row.rewards_type === 'none' ? 0 : roundMoney(balance * (rate / 100)),
    };
  }
}

function mapCharge(row: Record<string, unknown>): CreditCardCharge {
  return {
    id: row.id as string,
    cardId: row.card_id as string,
    amount: parseFloat(String(row.amount)) || 0,
    currency: row.currency as string,
    baseAmount: parseFloat(String(row.base_amount)) || 0,
    fxRate: parseFloat(String(row.fx_rate)) || 1,
    categoryId: (row.category_id as string | null) ?? null,
    vendor: (row.vendor as string | null) ?? null,
    date: row.date as string,
    notes: (row.notes as string | null) ?? null,
    statementPeriodStart: row.statement_period_start as string,
    statementPeriodEnd: row.statement_period_end as string,
    createdAt: row.created_at as string,
  };
}

function mapPayment(row: Record<string, unknown>): CreditCardPayment {
  return {
    id: row.id as string,
    cardId: row.card_id as string,
    amount: parseFloat(String(row.amount)) || 0,
    currency: row.currency as string,
    baseAmount: parseFloat(String(row.base_amount)) || 0,
    paidAt: row.paid_at as string,
    expenseId: (row.expense_id as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}
