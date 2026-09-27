import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller.js';
import { CurrencyModule } from '../currency/currency.module.js';
import { BillingModule } from '../billing/billing.module.js';

@Module({
  imports: [CurrencyModule, BillingModule],
  controllers: [ExpensesController],
})
export class ExpensesModule {}
