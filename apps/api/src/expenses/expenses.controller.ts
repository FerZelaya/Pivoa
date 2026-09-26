import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { CurrentUser } from '../auth/decorators/index.js';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/index.js';
import type { Expense, ExpenseWithCategory, PaginatedResponse } from '@pivoa/shared';
import { CurrencyService } from '../currency/currency.service.js';
import { mapExpense, mapExpenseWithCategory } from '../common/money.js';

@Controller('expenses')
export class ExpensesController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly currency: CurrencyService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedResponse<ExpenseWithCategory>> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const offset = (pageNum - 1) * pageSizeNum;

    let query = this.supabase
      .from('expenses')
      .select(
        `
        *,
        category:categories(id, name, icon, color)
      `,
        { count: 'exact' },
      )
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + pageSizeNum - 1);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    const term = search?.trim().replace(/[%,()*]/g, ' ');
    if (term) {
      query = query.or(`vendor.ilike.%${term}%,notes.ilike.%${term}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestException(`Failed to fetch expenses: ${error.message}`);
    }

    const total = count || 0;
    return {
      data: (data || []).map((expense) => mapExpenseWithCategory(expense)),
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil(total / pageSizeNum),
    };
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ExpenseWithCategory> {
    const { data, error } = await this.supabase
      .from('expenses')
      .select(
        `
        *,
        category:categories(id, name, icon, color)
      `,
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Expense not found');
    }

    return mapExpenseWithCategory(data);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateExpenseDto,
  ): Promise<Expense> {
    const converted = await this.convertAmount(user.id, dto.amount, dto.currency);

    const { data, error } = await this.supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: dto.amount,
        currency: converted.currency,
        base_amount: converted.baseAmount,
        fx_rate: converted.fxRate,
        category_id: dto.categoryId,
        vendor: dto.vendor || null,
        date: dto.date,
        receipt_image_url: dto.receiptImageUrl || null,
        notes: dto.notes || null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create expense: ${error.message}`);
    }

    return mapExpense(data);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<Expense> {
    const { data: existing, error: findError } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (findError || !existing) {
      throw new NotFoundException('Expense not found');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId;
    if (dto.vendor !== undefined) updateData.vendor = dto.vendor;
    if (dto.date !== undefined) updateData.date = dto.date;
    if (dto.receiptImageUrl !== undefined) updateData.receipt_image_url = dto.receiptImageUrl;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const amount = dto.amount ?? parseFloat(String(existing.amount));
    const currency = dto.currency ?? existing.currency;
    if (dto.amount !== undefined || dto.currency !== undefined) {
      const converted = await this.convertAmount(user.id, amount, currency);
      updateData.amount = amount;
      updateData.currency = converted.currency;
      updateData.base_amount = converted.baseAmount;
      updateData.fx_rate = converted.fxRate;
    }

    const { data, error } = await this.supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update expense: ${error.message}`);
    }

    return mapExpense(data);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const { error } = await this.supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new BadRequestException(`Failed to delete expense: ${error.message}`);
    }

    return { success: true };
  }

  private async convertAmount(userId: string, amount: number, currency?: string) {
    const { data: settings } = await this.supabase
      .from('user_settings')
      .select('currency')
      .eq('user_id', userId)
      .single();

    const base = this.currency.normalize(settings?.currency || 'USD');
    const source = this.currency.normalize(currency || base);
    const baseAmount = await this.currency.convert(amount, source, base);
    const fxRate = amount > 0 ? baseAmount / amount : 1;
    return { currency: source, baseAmount, fxRate };
  }
}
