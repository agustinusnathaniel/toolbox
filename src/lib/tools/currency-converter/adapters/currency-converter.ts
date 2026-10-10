/**
 * Pure currency-conversion logic for the currency-converter tool.
 *
 * Rates come from Frankfurter (https://frankfurter.dev), a free keyless API
 * serving daily ECB euro reference rates. This module never fetches — the
 * route owns fetching/caching, these helpers own parsing, math, and
 * freshness so they stay unit-testable without DOM or network mocks.
 */

export interface Currency {
  code: string;
  name: string;
}

/** Static ECB currency list (Frankfurter v1 `/currencies`, verified live). */
export const CURRENCIES: ReadonlyArray<Currency> = [
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Renminbi Yuan' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'ILS', name: 'Israeli New Shekel' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'ISK', name: 'Icelandic Króna' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'PLN', name: 'Polish Złoty' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'USD', name: 'United States Dollar' },
  { code: 'ZAR', name: 'South African Rand' },
];

const CURRENCY_CODES = new Set(CURRENCIES.map((c) => c.code));

export const DEFAULT_FROM = 'USD';
export const DEFAULT_TO = 'EUR';

/** Frankfurter publishes once per working day — 12h cache never misses a release. */
export const RATES_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export const RATES_API_BASE = 'https://api.frankfurter.dev/v1';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function ratesUrl(base: string): string {
  return `${RATES_API_BASE}/latest?base=${base}`;
}

export function isSupportedCurrency(code: string): boolean {
  return CURRENCY_CODES.has(code.toUpperCase());
}

export function normalizeCurrency(
  code: string | undefined,
  fallback: string
): string {
  if (code) {
    const upper = code.toUpperCase();
    if (CURRENCY_CODES.has(upper)) {
      return upper;
    }
  }
  return fallback;
}

export interface ParsedRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface ParseRatesResult {
  data?: ParsedRates;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate an unknown JSON payload into ParsedRates.
 * Same-currency conversion needs no rate, so an empty rates map is fine —
 * what matters is base/date shape and numeric rate values.
 */
export function parseRatesResponse(
  json: unknown,
  expectedBase: string
): ParseRatesResult {
  if (!isRecord(json)) {
    return { error: 'Unexpected API response shape' };
  }
  const { base, date, rates } = json;
  if (typeof base !== 'string' || base.toUpperCase() !== expectedBase) {
    return { error: 'API returned rates for the wrong base currency' };
  }
  if (typeof date !== 'string' || !DATE_PATTERN.test(date)) {
    return { error: 'API returned an invalid rate date' };
  }
  if (!isRecord(rates)) {
    return { error: 'API returned no rates table' };
  }
  const clean: Record<string, number> = {};
  for (const [code, rate] of Object.entries(rates)) {
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      return { error: `Invalid rate for ${code}` };
    }
    clean[code.toUpperCase()] = rate;
  }
  return { data: { base: base.toUpperCase(), date, rates: clean } };
}

export interface ConversionResult {
  error?: string;
  formatted?: string;
  isValid: boolean;
  rate?: number;
  value?: number;
}

/**
 * Convert an amount string with a fetched rate. Same-currency is rate 1
 * and never requires a network result.
 */
export function convertCurrency(
  amountRaw: string,
  from: string,
  to: string,
  rates: Record<string, number> | null
): ConversionResult {
  const amount = Number(amountRaw);
  if (amountRaw.trim() === '' || !Number.isFinite(amount)) {
    return { error: 'Enter a valid amount', isValid: false };
  }
  if (from === to) {
    return {
      formatted: formatAmount(amount, to),
      isValid: true,
      rate: 1,
      value: amount,
    };
  }
  const rate = rates?.[to];
  if (rate === undefined) {
    return { error: 'Rate unavailable — retry in a moment', isValid: false };
  }
  const value = amount * rate;
  return {
    formatted: formatAmount(value, to),
    isValid: true,
    rate,
    value,
  };
}

export function formatAmount(value: number, code: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      currency: code,
      maximumFractionDigits: 2,
      style: 'currency',
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}

/** Inverse rate for the "1 EUR = X USD" display line. */
export function inverseRate(rate: number): number {
  return 1 / rate;
}

/**
 * Human-readable rate with 6 significant digits — fixed fraction digits
 * collapse small rates (1 IDR = 0.0000559 USD renders as 0.0001 with 4dp).
 */
export function formatRate(rate: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumSignificantDigits: 6,
  }).format(rate);
}

export function isCacheFresh(cachedAtMs: number, nowMs: number): boolean {
  return nowMs - cachedAtMs < RATES_CACHE_TTL_MS;
}

/** Whole days between a YYYY-MM-DD rate date and now (UTC). Negative never. */
export function rateAgeDays(rateDate: string, nowMs: number): number {
  const published = Date.parse(`${rateDate}T00:00:00Z`);
  if (Number.isNaN(published)) {
    return 0;
  }
  return Math.max(0, Math.floor((nowMs - published) / 86_400_000));
}
