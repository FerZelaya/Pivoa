import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { CurrencyOption, ExchangeRates } from '@pivoa/shared';
import { roundMoney } from '../common/money.js';

interface CachedRates {
  data: ExchangeRates;
  expiresAt: number;
}

const CACHE_MS = 12 * 60 * 60 * 1000;
const PROVIDER = 'https://open.er-api.com/v6/latest';

@Injectable()
export class CurrencyService {
  private readonly cache = new Map<string, CachedRates>();

  async getRates(base = 'USD'): Promise<ExchangeRates> {
    const code = this.normalize(base);
    const cached = this.cache.get(code);
    if (cached && cached.expiresAt > Date.now()) {
      return { ...cached.data, stale: false };
    }

    try {
      const fresh = await this.fetchRates(code);
      this.cache.set(code, { data: fresh, expiresAt: Date.now() + CACHE_MS });
      return fresh;
    } catch (error) {
      if (cached) {
        return { ...cached.data, stale: true };
      }
      throw new ServiceUnavailableException(
        error instanceof Error ? error.message : 'Exchange rates are unavailable',
      );
    }
  }

  async convert(amount: number, from: string, to: string): Promise<number> {
    const source = this.normalize(from);
    const target = this.normalize(to);
    if (source === target) return roundMoney(amount);

    const rates = await this.getRates(source);
    const rate = rates.rates[target];
    if (!rate || !Number.isFinite(rate)) {
      throw new ServiceUnavailableException(`No exchange rate from ${source} to ${target}`);
    }
    return roundMoney(amount * rate);
  }

  async getRate(from: string, to: string): Promise<number> {
    const source = this.normalize(from);
    const target = this.normalize(to);
    if (source === target) return 1;
    const rates = await this.getRates(source);
    const rate = rates.rates[target];
    if (!rate || !Number.isFinite(rate)) {
      throw new ServiceUnavailableException(`No exchange rate from ${source} to ${target}`);
    }
    return rate;
  }

  async listCurrencies(): Promise<CurrencyOption[]> {
    const names = new Intl.DisplayNames(['en'], { type: 'currency' });
    const supported =
      typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('currency') : Object.keys((await this.getRates('USD')).rates);

    return supported
      .map((code) => {
        try {
          return { code, name: names.of(code) ?? code };
        } catch {
          return { code, name: code };
        }
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  normalize(code: string): string {
    return (code || 'USD').trim().toUpperCase().slice(0, 3);
  }

  private async fetchRates(base: string): Promise<ExchangeRates> {
    const response = await fetch(`${PROVIDER}/${base}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      throw new Error(`Exchange rate provider returned ${response.status}`);
    }
    const body = (await response.json()) as {
      result?: string;
      base_code?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    if (body.result !== 'success' || !body.rates) {
      throw new Error('Exchange rate provider returned an invalid payload');
    }
    return {
      base: body.base_code || base,
      rates: { ...body.rates, [body.base_code || base]: 1 },
      fetchedAt: body.time_last_update_utc || new Date().toISOString(),
      stale: false,
    };
  }
}
