import {
  DEFAULT_FROM,
  DEFAULT_TO,
  normalizeCurrency,
} from './currency-converter';

export interface CurrencyConverterSearchParams {
  amount?: string;
  from?: string;
  to?: string;
}

export function buildCurrencyConverterParams(
  amount: string,
  from: string,
  to: string
): URLSearchParams {
  const params = new URLSearchParams();
  if (amount.trim()) {
    params.set('amount', amount);
  }
  if (from !== DEFAULT_FROM) {
    params.set('from', from);
  }
  if (to !== DEFAULT_TO) {
    params.set('to', to);
  }
  return params;
}

export function buildCurrencyConverterStateFromSearch(search: {
  amount?: string;
  from?: string;
  to?: string;
}): { amount: string; from: string; to: string } {
  return {
    amount: search.amount ?? '',
    from: normalizeCurrency(search.from, DEFAULT_FROM),
    to: normalizeCurrency(search.to, DEFAULT_TO),
  };
}
