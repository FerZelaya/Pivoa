import type { UserSettings } from './settings.js';

export interface ExchangeRates {
  base: string;
  /** Rate to multiply an amount in `base` by, to get the quoted currency. */
  rates: Record<string, number>;
  fetchedAt: string;
  /** True when the live provider was unreachable and a cached snapshot was served. */
  stale: boolean;
}

export interface CurrencyOption {
  code: string;
  name: string;
}

export interface ChangeCurrencyDto {
  currency: string;
}

export interface ChangeCurrencyResult {
  settings: UserSettings;
  previousCurrency: string;
  rate: number;
  converted: {
    budgets: number;
    goals: number;
    expenses: number;
  };
}
