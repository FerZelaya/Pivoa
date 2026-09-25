import { Controller, Get, Query, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { CurrentUser } from '../auth/decorators/index.js';

interface SpendingSummary {
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  previousMonthTotal: number;
  changePercent: number;
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

  @Get('summary')
  async getSummary(@CurrentUser() user: User): Promise<SpendingSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month stats
    const { data: currentMonth } = await this.supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    // Previous month stats
    const { data: prevMonth } = await this.supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startOfPrevMonth.toISOString().split('T')[0])
      .lte('date', endOfPrevMonth.toISOString().split('T')[0]);

    const currentTotal = (currentMonth || []).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const currentCount = (currentMonth || []).length;
    const prevTotal = (prevMonth || []).reduce((sum, e) => sum + parseFloat(e.amount), 0);

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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data } = await this.supabase
      .from('expenses')
      .select(`
        amount,
        category:categories(id, name, icon, color)
      `)
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    if (!data || data.length === 0) {
      return [];
    }

    // Group by category
    const categoryMap = new Map<string, { 
      category: { id: string; name: string; icon: string; color: string };
      total: number; 
      count: number 
    }>();

    let grandTotal = 0;

    for (const expense of data) {
      const cat = expense.category as unknown as { id: string; name: string; icon: string; color: string };
      if (!cat) continue;
      
      const amount = parseFloat(expense.amount as string);
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
    @Query('days') days = '30',
  ): Promise<TrendDataPoint[]> {
    const daysNum = Math.min(90, Math.max(7, parseInt(days, 10) || 30));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const { data } = await this.supabase
      .from('expenses')
      .select('amount, date')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (!data || data.length === 0) {
      return [];
    }

    // Group by date or week
    const groupedData = new Map<string, { total: number; count: number }>();

    for (const expense of data) {
      let key: string;
      
      if (granularity === 'week') {
        const date = new Date(expense.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = expense.date;
      }

      const existing = groupedData.get(key);
      const amount = parseFloat(expense.amount);
      
      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        groupedData.set(key, { total: amount, count: 1 });
      }
    }

    return Array.from(groupedData.entries())
      .map(([date, data]) => ({
        date,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
