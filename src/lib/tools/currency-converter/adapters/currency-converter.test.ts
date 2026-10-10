import { describe, expect, test } from 'vite-plus/test';

import {
  convertCurrency,
  formatRate,
  isCacheFresh,
  normalizeCurrency,
  parseRatesResponse,
  RATES_CACHE_TTL_MS,
  rateAgeDays,
} from './currency-converter';

describe('parseRatesResponse', () => {
  const valid = {
    amount: 1,
    base: 'USD',
    date: '2026-10-09',
    rates: { EUR: 0.892_38, IDR: 17_881 },
  };

  test('accepts a well-formed Frankfurter payload', () => {
    const result = parseRatesResponse(valid, 'USD');
    expect(result.error).toBeUndefined();
    expect(result.data?.rates.EUR).toBe(0.892_38);
    expect(result.data?.date).toBe('2026-10-09');
  });

  test('rejects rates for the wrong base currency', () => {
    const result = parseRatesResponse({ ...valid, base: 'EUR' }, 'USD');
    expect(result.data).toBeUndefined();
    expect(result.error).toContain('base');
  });

  test('rejects non-numeric or non-positive rates', () => {
    const bad = { ...valid, rates: { EUR: 'lots' } };
    expect(parseRatesResponse(bad, 'USD').error).toContain('EUR');
    const zero = { ...valid, rates: { EUR: 0 } };
    expect(parseRatesResponse(zero, 'USD').error).toContain('EUR');
  });

  test('rejects a non-object payload', () => {
    expect(parseRatesResponse(null, 'USD').data).toBeUndefined();
    expect(parseRatesResponse([], 'USD').data).toBeUndefined();
  });
});

describe('convertCurrency', () => {
  const rates = { EUR: 0.9 };

  test('multiplies amount by rate', () => {
    const result = convertCurrency('100', 'USD', 'EUR', rates);
    expect(result.isValid).toBe(true);
    expect(result.value).toBeCloseTo(90, 10);
    expect(result.rate).toBe(0.9);
  });

  test('same-currency converts at 1 without rates', () => {
    const result = convertCurrency('50', 'USD', 'USD', null);
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(50);
  });

  test('rejects non-numeric amounts', () => {
    expect(convertCurrency('abc', 'USD', 'EUR', rates).isValid).toBe(false);
    expect(convertCurrency('', 'USD', 'EUR', rates).isValid).toBe(false);
  });

  test('reports missing rate instead of NaN', () => {
    const result = convertCurrency('10', 'USD', 'JPY', rates);
    expect(result.isValid).toBe(false);
    expect(result.value).toBeUndefined();
  });
});

describe('normalizeCurrency', () => {
  test('uppercases valid codes and falls back on unknown ones', () => {
    expect(normalizeCurrency('usd', 'EUR')).toBe('USD');
    expect(normalizeCurrency('XX', 'EUR')).toBe('EUR');
    expect(normalizeCurrency(undefined, 'EUR')).toBe('EUR');
  });
});

describe('formatRate', () => {
  test('keeps significant digits for sub-unit rates', () => {
    // 1 IDR in USD — 4 fraction digits would collapse this to 0.0001.
    expect(formatRate(1 / 17_881)).toContain('559');
  });

  test('keeps large rates readable', () => {
    expect(formatRate(17_881)).toContain('17');
  });
});

describe('cache freshness', () => {
  test('fresh within TTL, stale after', () => {
    const now = 1_000_000_000_000;
    expect(isCacheFresh(now - RATES_CACHE_TTL_MS + 1, now)).toBe(true);
    expect(isCacheFresh(now - RATES_CACHE_TTL_MS - 1, now)).toBe(false);
  });

  test('rate age counts whole UTC days', () => {
    const now = Date.parse('2026-10-10T12:00:00Z');
    expect(rateAgeDays('2026-10-09', now)).toBe(1);
    expect(rateAgeDays('2026-10-10', now)).toBe(0);
  });
});
