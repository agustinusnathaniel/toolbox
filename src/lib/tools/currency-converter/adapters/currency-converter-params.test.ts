import { describe, expect, test } from 'vite-plus/test';

import { DEFAULT_FROM, DEFAULT_TO } from './currency-converter';
import {
  buildCurrencyConverterParams,
  buildCurrencyConverterStateFromSearch,
} from './currency-converter-params';

describe('buildCurrencyConverterParams', () => {
  test('omits defaults so shared links stay short', () => {
    const params = buildCurrencyConverterParams('', DEFAULT_FROM, DEFAULT_TO);
    expect(params.toString()).toBe('');
  });

  test('round-trips a full state through URL params', () => {
    const params = buildCurrencyConverterParams('250', 'IDR', 'JPY');
    const state = buildCurrencyConverterStateFromSearch(
      Object.fromEntries(params.entries())
    );
    expect(state).toEqual({ amount: '250', from: 'IDR', to: 'JPY' });
  });

  test('normalizes invalid codes to defaults', () => {
    const state = buildCurrencyConverterStateFromSearch({
      from: 'XX',
      to: 'usd',
    });
    expect(state.from).toBe(DEFAULT_FROM);
    expect(state.to).toBe('USD');
  });
});
