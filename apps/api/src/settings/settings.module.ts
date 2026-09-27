import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller.js';
import { CurrencyModule } from '../currency/currency.module.js';
import { BillingModule } from '../billing/billing.module.js';

@Module({
  imports: [CurrencyModule, BillingModule],
  controllers: [SettingsController],
})
export class SettingsModule {}
