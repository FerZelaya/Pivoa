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
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { CurrentUser } from '../auth/decorators/index.js';
import { CreateSavingsGoalDto, UpdateSavingsGoalDto, DepositToGoalDto } from './dto/index.js';
import type { SavingsGoal, SavingsGoalWithProgress } from '@pivoa/shared';

@Controller('goals')
export class GoalsController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  private calculateMonthlyRequired(
    remaining: number,
    targetDate: string | null,
  ): number | null {
    if (!targetDate) return null;

    const now = new Date();
    const target = new Date(targetDate);
    const monthsDiff =
      (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth());

    if (monthsDiff <= 0) return remaining; // Due now or overdue
    return Math.round((remaining / monthsDiff) * 100) / 100;
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<SavingsGoalWithProgress[]> {
    const { data: goals, error } = await this.supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      throw new BadRequestException(`Failed to fetch goals: ${error.message}`);
    }

    return (goals || []).map((goal) => {
      const targetAmount = parseFloat(goal.target_amount);
      const currentAmount = parseFloat(goal.current_amount);
      const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
      const remaining = Math.max(0, targetAmount - currentAmount);

      return {
        id: goal.id,
        userId: goal.user_id,
        name: goal.name,
        targetAmount,
        currentAmount,
        targetDate: goal.target_date,
        icon: goal.icon,
        color: goal.color,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
        percentage: Math.round(percentage * 10) / 10,
        remaining,
        monthlyRequired: this.calculateMonthlyRequired(remaining, goal.target_date),
      };
    });
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<SavingsGoalWithProgress> {
    const { data: goal, error } = await this.supabase
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !goal) {
      throw new NotFoundException('Goal not found');
    }

    const targetAmount = parseFloat(goal.target_amount);
    const currentAmount = parseFloat(goal.current_amount);
    const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const remaining = Math.max(0, targetAmount - currentAmount);

    return {
      id: goal.id,
      userId: goal.user_id,
      name: goal.name,
      targetAmount,
      currentAmount,
      targetDate: goal.target_date,
      icon: goal.icon,
      color: goal.color,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
      percentage: Math.round(percentage * 10) / 10,
      remaining,
      monthlyRequired: this.calculateMonthlyRequired(remaining, goal.target_date),
    };
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    const { data, error } = await this.supabase
      .from('savings_goals')
      .insert({
        user_id: user.id,
        name: dto.name,
        target_amount: dto.targetAmount,
        current_amount: dto.currentAmount || 0,
        target_date: dto.targetDate || null,
        icon: dto.icon || 'piggy-bank',
        color: dto.color || '#4F46E5',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create goal: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: parseFloat(data.target_amount),
      currentAmount: parseFloat(data.current_amount),
      targetDate: data.target_date,
      icon: data.icon,
      color: data.color,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    // Verify ownership
    const { data: existing, error: findError } = await this.supabase
      .from('savings_goals')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (findError || !existing) {
      throw new NotFoundException('Goal not found');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.targetAmount !== undefined) updateData.target_amount = dto.targetAmount;
    if (dto.currentAmount !== undefined) updateData.current_amount = dto.currentAmount;
    if (dto.targetDate !== undefined) updateData.target_date = dto.targetDate;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.color !== undefined) updateData.color = dto.color;

    const { data, error } = await this.supabase
      .from('savings_goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update goal: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: parseFloat(data.target_amount),
      currentAmount: parseFloat(data.current_amount),
      targetDate: data.target_date,
      icon: data.icon,
      color: data.color,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  @Post(':id/deposit')
  async deposit(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: DepositToGoalDto,
  ): Promise<SavingsGoal> {
    // Get current amount
    const { data: goal, error: findError } = await this.supabase
      .from('savings_goals')
      .select('current_amount')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (findError || !goal) {
      throw new NotFoundException('Goal not found');
    }

    const newAmount = parseFloat(goal.current_amount) + dto.amount;

    const { data, error } = await this.supabase
      .from('savings_goals')
      .update({ current_amount: newAmount })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to deposit: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: parseFloat(data.target_amount),
      currentAmount: parseFloat(data.current_amount),
      targetDate: data.target_date,
      icon: data.icon,
      color: data.color,
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
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new BadRequestException(`Failed to delete goal: ${error.message}`);
    }

    return { success: true };
  }
}
