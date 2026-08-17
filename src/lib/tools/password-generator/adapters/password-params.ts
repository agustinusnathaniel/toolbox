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
    params.set('lowercase', options.lowercase ? '1' : '0');
  }
  if (options.uppercase !== DEFAULTS.uppercase) {
    params.set('uppercase', options.uppercase ? '1' : '0');
  }
  if (options.digits !== DEFAULTS.digits) {
    params.set('digits', options.digits ? '1' : '0');
  }
  if (options.symbols !== DEFAULTS.symbols) {
    params.set('symbols', options.symbols ? '1' : '0');
  }
  if (options.excludeAmbiguous !== DEFAULTS.excludeAmbiguous) {
    params.set('excludeAmbiguous', options.excludeAmbiguous ? '1' : '0');
  }
  return params;
}

export function buildPasswordStateFromSearch(
  search: PasswordSearchParams
): PasswordOptions {
  const length = Number(search.length);
  return {
    digits: search.digits === '0' ? false : DEFAULTS.digits,
    excludeAmbiguous: search.excludeAmbiguous === '1',
    length:
      Number.isInteger(length) && length >= 8 && length <= 128
        ? length
        : DEFAULTS.length,
    lowercase: search.lowercase === '0' ? false : DEFAULTS.lowercase,
    symbols: search.symbols === '1',
    uppercase: search.uppercase === '0' ? false : DEFAULTS.uppercase,
  };
}
