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

@Controller('expenses')
export class ExpensesController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PaginatedResponse<ExpenseWithCategory>> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const offset = (pageNum - 1) * pageSizeNum;

    let query = this.supabase
      .from('expenses')
      .select(`
        *,
        category:categories(id, name, icon, color)
      `, { count: 'exact' })
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

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestException(`Failed to fetch expenses: ${error.message}`);
    }

    const total = count || 0;
    const expenses: ExpenseWithCategory[] = (data || []).map((expense) => ({
      id: expense.id,
      userId: expense.user_id,
      amount: parseFloat(expense.amount),
      currency: expense.currency,
      categoryId: expense.category_id,
      vendor: expense.vendor,
      date: expense.date,
      receiptImageUrl: expense.receipt_image_url,
      notes: expense.notes,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at,
      category: expense.category,
    }));

    return {
      data: expenses,
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
      .select(`
        *,
        category:categories(id, name, icon, color)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Expense not found');
    }

    return {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      currency: data.currency,
      categoryId: data.category_id,
      vendor: data.vendor,
      date: data.date,
      receiptImageUrl: data.receipt_image_url,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      category: data.category,
    };
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createExpenseDto: CreateExpenseDto,
  ): Promise<Expense> {
    const { data, error } = await this.supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: createExpenseDto.amount,
        currency: createExpenseDto.currency || 'USD',
        category_id: createExpenseDto.categoryId,
        vendor: createExpenseDto.vendor || null,
        date: createExpenseDto.date,
        receipt_image_url: createExpenseDto.receiptImageUrl || null,
        notes: createExpenseDto.notes || null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create expense: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      currency: data.currency,
      categoryId: data.category_id,
      vendor: data.vendor,
      date: data.date,
      receiptImageUrl: data.receipt_image_url,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    // First verify the expense belongs to the user
    const { data: existing, error: findError } = await this.supabase
      .from('expenses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (findError || !existing) {
      throw new NotFoundException('Expense not found');
    }

    // Build the update object with snake_case keys
    const updateData: Record<string, unknown> = {};
    if (updateExpenseDto.amount !== undefined) updateData.amount = updateExpenseDto.amount;
    if (updateExpenseDto.currency !== undefined) updateData.currency = updateExpenseDto.currency;
    if (updateExpenseDto.categoryId !== undefined) updateData.category_id = updateExpenseDto.categoryId;
    if (updateExpenseDto.vendor !== undefined) updateData.vendor = updateExpenseDto.vendor;
    if (updateExpenseDto.date !== undefined) updateData.date = updateExpenseDto.date;
    if (updateExpenseDto.receiptImageUrl !== undefined) updateData.receipt_image_url = updateExpenseDto.receiptImageUrl;
    if (updateExpenseDto.notes !== undefined) updateData.notes = updateExpenseDto.notes;

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

    return {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      currency: data.currency,
      categoryId: data.category_id,
      vendor: data.vendor,
      date: data.date,
      receiptImageUrl: data.receipt_image_url,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
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
}
