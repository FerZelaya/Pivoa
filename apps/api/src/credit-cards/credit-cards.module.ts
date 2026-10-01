import { Module } from '@nestjs/common';
import { CurrencyModule } from '../currency/currency.module.js';
import { CreditCardsController } from './credit-cards.controller.js';

@Module({
  imports: [CurrencyModule],
  controllers: [CreditCardsController],
})
export class CreditCardsModule {}
