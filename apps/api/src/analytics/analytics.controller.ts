import { Controller, Get, Query, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { CurrentUser } from '../auth/decorators/index.js';
import { getCycleWindow } from '../common/cycle.js';
import { baseAmountOf } from '../common/money.js';

interface SpendingSummary {
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  previousMonthTotal: number;
  changePercent: number;
}

interface OverviewMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlySpent: number;
  netSavings: number;
  savingsRate: number;
  budgetUsed: number;
  budgetRemaining: number;
  budgetPercentage: number;
  daysInMonth: number;
  daysRemaining: number;
  dailyBudget: number;
  projectedMonthEnd: number;
  isOverBudget: boolean;
  changeFromLastMonth: number;
  cycleStart: string;
  cycleEnd: string;
  currency: string;
}

interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  count: number;
  percentage: number;
}

interface TrendDataPoint {
  date: string;
  total: number;
  count: number;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  private async loadCycle(userId: string, offset = 0) {
    const { data } = await this.supabase
      .from('user_settings')
      .select('cycle_start_day, monthly_income_cap, currency')
      .eq('user_id', userId)
      .single();

    const cycleStartDay = Number(data?.cycle_start_day) || 1;
    return {
      window: getCycleWindow(cycleStartDay, new Date(), offset),
      monthlyIncome: parseFloat(String(data?.monthly_income_cap ?? 0)) || 0,
      currency: (data?.currency as string) || 'USD',
      cycleStartDay,
    };
  }

  @Get('summary')
  async getSummary(@CurrentUser() user: User): Promise<SpendingSummary> {
    const current = await this.loadCycle(user.id, 0);
    const previous = getCycleWindow(current.cycleStartDay, new Date(), -1);

    const { data: currentMonth } = await this.supabase
      .from('expenses')
      .select('amount, base_amount')
      .eq('user_id', user.id)
      .gte('date', current.window.start)
      .lte('date', current.window.end);

    const { data: prevMonth } = await this.supabase
      .from('expenses')
      .select('amount, base_amount')
      .eq('user_id', user.id)
      .gte('date', previous.start)
      .lte('date', previous.end);

    const currentTotal = (currentMonth || []).reduce((sum, e) => sum + baseAmountOf(e), 0);
    const currentCount = (currentMonth || []).length;
    const prevTotal = (prevMonth || []).reduce((sum, e) => sum + baseAmountOf(e), 0);

    let changePercent = 0;
    if (prevTotal > 0) {
      changePercent = ((currentTotal - prevTotal) / prevTotal) * 100;
    }

    return {
      totalSpent: currentTotal,
      transactionCount: currentCount,
      averageTransaction: currentCount > 0 ? currentTotal / currentCount : 0,
      previousMonthTotal: prevTotal,
      changePercent,
    };
  }

  @Get('by-category')
  async getByCategory(@CurrentUser() user: User): Promise<CategorySpending[]> {
    const { window } = await this.loadCycle(user.id);

    const { data } = await this.supabase
      .from('expenses')
      .select(`
        amount,
        base_amount,
        category:categories(id, name, icon, color)
      `)
      .eq('user_id', user.id)
      .gte('date', window.start)
      .lte('date', window.end);

    if (!data || data.length === 0) {
      return [];
    }

    const categoryMap = new Map<string, {
      category: { id: string; name: string; icon: string; color: string };
      total: number;
      count: number;
    }>();

    let grandTotal = 0;

    for (const expense of data) {
      const cat = expense.category as unknown as { id: string; name: string; icon: string; color: string };
      if (!cat) continue;

      const amount = baseAmountOf(expense);
      grandTotal += amount;

      const existing = categoryMap.get(cat.id);
      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        categoryMap.set(cat.id, { category: cat, total: amount, count: 1 });
      }
    }

    return Array.from(categoryMap.values())
      .map((item) => ({
        categoryId: item.category.id,
        categoryName: item.category.name,
        categoryIcon: item.category.icon,
        categoryColor: item.category.color,
        total: item.total,
        count: item.count,
        percentage: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  @Get('trend')
  async getTrend(
    @CurrentUser() user: User,
    @Query('granularity') granularity: 'day' | 'week' = 'day',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<TrendDataPoint[]> {
    const { window } = await this.loadCycle(user.id);
    const startDate = from || window.start;
    const endDate = to || window.end;

    let query = this.supabase
      .from('expenses')
      .select('amount, base_amount, date')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      return [];
    }

    const groupedData = new Map<string, { total: number; count: number }>();

    for (const expense of data) {
      let key: string;

      if (granularity === 'week') {
        const date = new Date(`${expense.date}T00:00:00`);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = expense.date;
      }

      const existing = groupedData.get(key);
      const amount = baseAmountOf(expense);

      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        groupedData.set(key, { total: amount, count: 1 });
      }
    }

    return Array.from(groupedData.entries())
      .map(([date, point]) => ({
        date,
        total: point.total,
        count: point.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  @Get('overview')
  async getOverview(@CurrentUser() user: User): Promise<OverviewMetrics> {
    const current = await this.loadCycle(user.id, 0);
    const previous = getCycleWindow(current.cycleStartDay, new Date(), -1);
    const { window, monthlyIncome, currency } = current;

    const { data: currentExpenses } = await this.supabase
      .from('expenses')
      .select('amount, base_amount')
      .eq('user_id', user.id)
      .gte('date', window.start)
      .lte('date', window.end);

    const { data: prevExpenses } = await this.supabase
      .from('expenses')
      .select('amount, base_amount')
      .eq('user_id', user.id)
      .gte('date', previous.start)
      .lte('date', previous.end);

    const { data: goals } = await this.supabase
      .from('savings_goals')
      .select('current_amount')
      .eq('user_id', user.id);

    const monthlySpent = (currentExpenses || []).reduce((sum, e) => sum + baseAmountOf(e), 0);
    const prevMonthSpent = (prevExpenses || []).reduce((sum, e) => sum + baseAmountOf(e), 0);
    const totalSavings = (goals || []).reduce(
      (sum, g) => sum + parseFloat(String(g.current_amount)),
      0,
    );

    const netSavings = monthlyIncome - monthlySpent;
    const savingsRate = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;
    const budgetRemaining = Math.max(0, monthlyIncome - monthlySpent);
    const budgetPercentage = monthlyIncome > 0 ? (monthlySpent / monthlyIncome) * 100 : 0;

    const { daysInCycle, dayIndex, daysRemaining } = window;
    const dailyBudget = daysRemaining > 0 ? budgetRemaining / daysRemaining : 0;
    const avgDailySpend = dayIndex > 0 ? monthlySpent / dayIndex : 0;
    const projectedMonthEnd = avgDailySpend * daysInCycle;

    let changeFromLastMonth = 0;
    if (prevMonthSpent > 0) {
      changeFromLastMonth = ((monthlySpent - prevMonthSpent) / prevMonthSpent) * 100;
    }

    return {
      totalBalance: totalSavings,
      monthlyIncome,
      monthlySpent: Math.round(monthlySpent * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      budgetUsed: Math.round(monthlySpent * 100) / 100,
      budgetRemaining: Math.round(budgetRemaining * 100) / 100,
      budgetPercentage: Math.round(budgetPercentage * 10) / 10,
      daysInMonth: daysInCycle,
      daysRemaining,
      dailyBudget: Math.round(dailyBudget * 100) / 100,
      projectedMonthEnd: Math.round(projectedMonthEnd * 100) / 100,
      isOverBudget: monthlySpent > monthlyIncome,
      changeFromLastMonth: Math.round(changeFromLastMonth * 10) / 10,
      cycleStart: window.start,
      cycleEnd: window.end,
      currency,
    };
  }
}
