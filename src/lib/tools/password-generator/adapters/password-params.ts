import { readFlag, writeFlag } from '@/lib/utils/search-params';

import type { PasswordOptions } from './password-generator';

export interface PasswordSearchParams {
  digits?: string;
  excludeAmbiguous?: string;
  length?: string;
  lowercase?: string;
  symbols?: string;
  uppercase?: string;
}

const DEFAULTS: PasswordOptions = {
  digits: true,
  excludeAmbiguous: false,
  length: 20,
  lowercase: true,
  symbols: false,
  uppercase: true,
};

export function buildPasswordParams(options: PasswordOptions): URLSearchParams {
  const params = new URLSearchParams();
  if (options.length !== DEFAULTS.length) {
    params.set('length', String(options.length));
  }
  if (options.lowercase !== DEFAULTS.lowercase) {
    params.set('lowercase', writeFlag(options.lowercase));
  }
  if (options.uppercase !== DEFAULTS.uppercase) {
    params.set('uppercase', writeFlag(options.uppercase));
  }
  if (options.digits !== DEFAULTS.digits) {
    params.set('digits', writeFlag(options.digits));
  }
  if (options.symbols !== DEFAULTS.symbols) {
    params.set('symbols', writeFlag(options.symbols));
  }
  if (options.excludeAmbiguous !== DEFAULTS.excludeAmbiguous) {
    params.set('excludeAmbiguous', writeFlag(options.excludeAmbiguous));
  }
  return params;
}

export function buildPasswordStateFromSearch(
  search: PasswordSearchParams
): PasswordOptions {
  const length = Number(search.length);
  return {
    digits: readFlag(search.digits, DEFAULTS.digits),
    excludeAmbiguous: readFlag(
      search.excludeAmbiguous,
      DEFAULTS.excludeAmbiguous
    ),
    length:
      Number.isInteger(length) && length >= 8 && length <= 128
        ? length
        : DEFAULTS.length,
    lowercase: readFlag(search.lowercase, DEFAULTS.lowercase),
    symbols: readFlag(search.symbols, DEFAULTS.symbols),
    uppercase: readFlag(search.uppercase, DEFAULTS.uppercase),
  };
}
