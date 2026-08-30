import type { NumberBase } from './number-base';
import { normalizeBase } from './number-base';

export type NumberBaseString = '2' | '8' | '10' | '16';

export interface NumberBaseSearchParams {
  from?: string;
  input?: string;
}

export function buildNumberBaseParams(
  input: string,
  fromBase: NumberBase
): URLSearchParams {
  const params = new URLSearchParams();
  if (input.trim()) {
    params.set('input', input);
  }
  if (fromBase !== 10) {
    params.set('from', String(fromBase));
  }
  return params;
}

export function buildNumberBaseStateFromSearch(
  search: NumberBaseSearchParams
): {
  fromBase: NumberBase;
  input: string;
} {
  return {
    fromBase: normalizeBase(search.from),
    input: search.input ?? '',
  };
}
