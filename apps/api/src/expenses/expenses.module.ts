import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller.js';
import { CurrencyModule } from '../currency/currency.module.js';

@Module({
  imports: [CurrencyModule],
  controllers: [ExpensesController],
})
export class ExpensesModule {}
