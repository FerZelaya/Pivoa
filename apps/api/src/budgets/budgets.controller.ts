import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { CurrentUser } from '../auth/decorators/index.js';
import { CreateCategoryBudgetDto, UpdateCategoryBudgetDto } from './dto/index.js';
import type { CategoryBudget, CategoryBudgetWithSpent, BudgetSummary } from '@pivoa/shared';
import { getCycleWindow } from '../common/cycle.js';
import { baseAmountOf } from '../common/money.js';

@Controller('budgets')
export class BudgetsController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: User): Promise<CategoryBudgetWithSpent[]> {
    // Get all category budgets with their categories
    const { data: budgets, error: budgetsError } = await this.supabase
      .from('category_budgets')
      .select(`
        *,
        category:categories(id, name, icon, color)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (budgetsError) {
      throw new BadRequestException(`Failed to fetch budgets: ${budgetsError.message}`);
    }

    const { data: settings } = await this.supabase
      .from('user_settings')
      .select('cycle_start_day')
      .eq('user_id', user.id)
      .single();
    const window = getCycleWindow(Number(settings?.cycle_start_day) || 1);

    const { data: expenses, error: expensesError } = await this.supabase
      .from('expenses')
      .select('category_id, amount, base_amount')
      .eq('user_id', user.id)
      .gte('date', window.start)
      .lte('date', window.end);

    if (expensesError) {
      throw new BadRequestException(`Failed to fetch expenses: ${expensesError.message}`);
    }

    // Calculate spent per category
    const spentByCategory: Record<string, number> = {};
    for (const expense of expenses || []) {
      const categoryId = expense.category_id;
      const amount = baseAmountOf(expense);
      spentByCategory[categoryId] = (spentByCategory[categoryId] || 0) + amount;
    }

    return (budgets || []).map((budget) => {
      const monthlyLimit = parseFloat(budget.monthly_limit);
      const spent = spentByCategory[budget.category_id] || 0;
      const percentage = monthlyLimit > 0 ? (spent / monthlyLimit) * 100 : 0;
      const remaining = Math.max(0, monthlyLimit - spent);

      return {
        id: budget.id,
        userId: budget.user_id,
        categoryId: budget.category_id,
        monthlyLimit,
        createdAt: budget.created_at,
        updatedAt: budget.updated_at,
        category: budget.category,
        spent: Math.round(spent * 100) / 100,
        percentage: Math.round(percentage * 10) / 10,
        remaining: Math.round(remaining * 100) / 100,
      };
    });
  }

  @Get('summary')
  async getSummary(@CurrentUser() user: User): Promise<BudgetSummary> {
    // Get user settings for total budget
    const { data: settings } = await this.supabase
      .from('user_settings')
      .select('monthly_income_cap, cycle_start_day')
      .eq('user_id', user.id)
      .single();

    const totalBudget = parseFloat(settings?.monthly_income_cap) || 0;
    const window = getCycleWindow(Number(settings?.cycle_start_day) || 1);

    const { data: expenses, error: expensesError } = await this.supabase
      .from('expenses')
      .select('amount, base_amount')
      .eq('user_id', user.id)
      .gte('date', window.start)
      .lte('date', window.end);

    if (expensesError) {
      throw new BadRequestException(`Failed to fetch expenses: ${expensesError.message}`);
    }

    const totalSpent = (expenses || []).reduce((sum, e) => sum + baseAmountOf(e), 0);

    const { daysInCycle, dayIndex, daysRemaining } = window;
    const daysElapsed = dayIndex;

    // Calculate daily budget and projection
    const dailyBudget = daysRemaining > 0 ? (totalBudget - totalSpent) / daysRemaining : 0;
    const avgDailySpend = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
    const projectedSpend = avgDailySpend * daysInCycle;

    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const remaining = Math.max(0, totalBudget - totalSpent);

    return {
      totalBudget,
      totalSpent: Math.round(totalSpent * 100) / 100,
      percentage: Math.round(percentage * 10) / 10,
      remaining: Math.round(remaining * 100) / 100,
      daysRemaining,
      dailyBudget: Math.round(dailyBudget * 100) / 100,
      projectedSpend: Math.round(projectedSpend * 100) / 100,
      isOverBudget: totalSpent > totalBudget,
    };
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateCategoryBudgetDto,
  ): Promise<CategoryBudget> {
    // Check if budget already exists for this category
    const { data: existing } = await this.supabase
      .from('category_budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('category_id', dto.categoryId)
      .single();

    if (existing) {
      throw new ConflictException('Budget already exists for this category');
    }

    const { data, error } = await this.supabase
      .from('category_budgets')
      .insert({
        user_id: user.id,
        category_id: dto.categoryId,
        monthly_limit: dto.monthlyLimit,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create budget: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      categoryId: data.category_id,
      monthlyLimit: parseFloat(data.monthly_limit),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryBudgetDto,
  ): Promise<CategoryBudget> {
    // Verify ownership
    const { data: existing, error: findError } = await this.supabase
      .from('category_budgets')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (findError || !existing) {
      throw new NotFoundException('Budget not found');
    }

    const { data, error } = await this.supabase
      .from('category_budgets')
      .update({ monthly_limit: dto.monthlyLimit })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update budget: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      categoryId: data.category_id,
      monthlyLimit: parseFloat(data.monthly_limit),
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
      .from('category_budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new BadRequestException(`Failed to delete budget: ${error.message}`);
    }

    return { success: true };
  }
}
