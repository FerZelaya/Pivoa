import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { CurrentUser } from '../auth/decorators/index.js';
import { UpdateSettingsDto, CompleteOnboardingDto, ChangeCurrencyDto } from './dto/index.js';
import type { ChangeCurrencyResult, UserSettings } from '@pivoa/shared';
import { CurrencyService } from '../currency/currency.service.js';
import { EntitlementsService } from '../billing/entitlements.service.js';
import { mapSettings, roundMoney } from '../common/money.js';

@Controller('settings')
export class SettingsController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly currency: CurrencyService,
    private readonly entitlements: EntitlementsService,
  ) {}

  @Get()
  async getSettings(@CurrentUser() user: User): Promise<UserSettings> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to load settings: ${error.message}`);
    }
    if (data) {
      return mapSettings(data);
    }

    const { data: newSettings, error: createError } = await this.supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        monthly_income_cap: 0,
        currency: 'USD',
        cycle_start_day: 1,
        onboarding_completed: false,
      })
      .select()
      .single();

    if (createError || !newSettings) {
      throw new BadRequestException('Failed to create user settings');
    }

    return mapSettings(newSettings);
  }

  @Patch()
  async updateSettings(
    @CurrentUser() user: User,
    @Body() dto: UpdateSettingsDto,
  ): Promise<UserSettings> {
    const updateData: Record<string, unknown> = {};

    if (dto.monthlyIncomeCap !== undefined) {
      updateData.monthly_income_cap = dto.monthlyIncomeCap;
    }
    if (dto.cycleStartDay !== undefined) {
      updateData.cycle_start_day = dto.cycleStartDay;
    }
    if (dto.language !== undefined) {
      updateData.language = dto.language;
    }
    if (dto.tutorialCompleted !== undefined) {
      updateData.tutorial_completed = dto.tutorialCompleted;
    }

    if (Object.keys(updateData).length === 0) {
      return this.getSettings(user);
    }

    const { data, error } = await this.supabase
      .from('user_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update settings: ${error.message}`);
    }
    if (!data) {
      throw new NotFoundException('User settings not found');
    }

    return mapSettings(data);
  }

  @Post('complete-onboarding')
  async completeOnboarding(
    @CurrentUser() user: User,
    @Body() dto: CompleteOnboardingDto,
  ): Promise<UserSettings> {
    const updateData: Record<string, unknown> = {
      monthly_income_cap: dto.monthlyIncomeCap,
      onboarding_completed: true,
    };

    if (dto.currency) {
      updateData.currency = this.currency.normalize(dto.currency);
    }
    if (dto.cycleStartDay !== undefined) {
      updateData.cycle_start_day = dto.cycleStartDay;
    }
    if (dto.language !== undefined) {
      updateData.language = dto.language;
    }

    const { data, error } = await this.supabase
      .from('user_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to complete onboarding: ${error.message}`);
    }
    if (!data) {
      throw new NotFoundException('User settings not found');
    }

    return mapSettings(data);
  }

  @Post('change-currency')
  async changeCurrency(
    @CurrentUser() user: User,
    @Body() dto: ChangeCurrencyDto,
  ): Promise<ChangeCurrencyResult> {
    await this.entitlements.assertCanChangeCurrency(user.id);
    const nextCurrency = this.currency.normalize(dto.currency);
    const settings = await this.getSettings(user);
    const previousCurrency = this.currency.normalize(settings.currency);

    if (previousCurrency === nextCurrency) {
      return {
        settings,
        previousCurrency,
        rate: 1,
        converted: { budgets: 0, goals: 0, expenses: 0 },
      };
    }

    const rate = await this.currency.getRate(previousCurrency, nextCurrency);

    const { data: expenses, error: expensesError } = await this.supabase
      .from('expenses')
      .select('id, amount, currency')
      .eq('user_id', user.id);
    if (expensesError) {
      throw new BadRequestException(`Failed to load expenses: ${expensesError.message}`);
    }

    const { data: budgets, error: budgetsError } = await this.supabase
      .from('category_budgets')
      .select('id, monthly_limit')
      .eq('user_id', user.id);
    if (budgetsError) {
      throw new BadRequestException(`Failed to load budgets: ${budgetsError.message}`);
    }

    const { data: goals, error: goalsError } = await this.supabase
      .from('savings_goals')
      .select('id, target_amount, current_amount')
      .eq('user_id', user.id);
    if (goalsError) {
      throw new BadRequestException(`Failed to load goals: ${goalsError.message}`);
    }

    let convertedExpenses = 0;
    for (const expense of expenses || []) {
      const amount = parseFloat(String(expense.amount)) || 0;
      const source = this.currency.normalize(expense.currency || previousCurrency);
      const baseAmount = await this.currency.convert(amount, source, nextCurrency);
      const fxRate = amount > 0 ? baseAmount / amount : 1;
      const { error } = await this.supabase
        .from('expenses')
        .update({ base_amount: baseAmount, fx_rate: fxRate })
        .eq('id', expense.id)
        .eq('user_id', user.id);
      if (error) {
        throw new BadRequestException(`Failed to convert expense: ${error.message}`);
      }
      convertedExpenses += 1;
    }

    let convertedBudgets = 0;
    for (const budget of budgets || []) {
      const limit = roundMoney((parseFloat(String(budget.monthly_limit)) || 0) * rate);
      const { error } = await this.supabase
        .from('category_budgets')
        .update({ monthly_limit: Math.max(0.01, limit) })
        .eq('id', budget.id)
        .eq('user_id', user.id);
      if (error) {
        throw new BadRequestException(`Failed to convert budget: ${error.message}`);
      }
      convertedBudgets += 1;
    }

    let convertedGoals = 0;
    for (const goal of goals || []) {
      const { error } = await this.supabase
        .from('savings_goals')
        .update({
          target_amount: Math.max(0.01, roundMoney((parseFloat(String(goal.target_amount)) || 0) * rate)),
          current_amount: roundMoney((parseFloat(String(goal.current_amount)) || 0) * rate),
        })
        .eq('id', goal.id)
        .eq('user_id', user.id);
      if (error) {
        throw new BadRequestException(`Failed to convert goal: ${error.message}`);
      }
      convertedGoals += 1;
    }

    const { data: updated, error: settingsError } = await this.supabase
      .from('user_settings')
      .update({
        currency: nextCurrency,
        monthly_income_cap: roundMoney(settings.monthlyIncomeCap * rate),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (settingsError || !updated) {
      throw new BadRequestException(`Failed to update currency: ${settingsError?.message ?? 'unknown error'}`);
    }

    return {
      settings: mapSettings(updated),
      previousCurrency,
      rate,
      converted: {
        budgets: convertedBudgets,
        goals: convertedGoals,
        expenses: convertedExpenses,
      },
    };
  }
}
