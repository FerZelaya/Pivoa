import { Controller, Get, Query } from '@nestjs/common';
import type { CurrencyOption, ExchangeRates } from '@pivoa/shared';
import { CurrencyService } from './currency.service.js';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currency: CurrencyService) {}

  @Get('rates')
  async getRates(@Query('base') base = 'USD'): Promise<ExchangeRates> {
    return this.currency.getRates(base);
  }

  @Get('list')
  async list(): Promise<CurrencyOption[]> {
    return this.currency.listCurrencies();
  }
}
