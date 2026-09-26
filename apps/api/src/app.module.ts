import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthModule } from './health/health.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ExpensesModule } from './expenses/expenses.module.js';
import { ReceiptsModule } from './receipts/receipts.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { BudgetsModule } from './budgets/budgets.module.js';
import { GoalsModule } from './goals/goals.module.js';
import { CurrencyModule } from './currency/currency.module.js';
import { validate } from './config/env.validation.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    SupabaseModule,
    AuthModule,
    HealthModule,
    CategoriesModule,
    ExpensesModule,
    ReceiptsModule,
    AnalyticsModule,
    SettingsModule,
    BudgetsModule,
    GoalsModule,
    CurrencyModule,
  ],
})
export class AppModule {}
