import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller.js';
import { CurrencyModule } from '../currency/currency.module.js';

@Module({
  imports: [CurrencyModule],
  controllers: [SettingsController],
})
export class SettingsModule {}
