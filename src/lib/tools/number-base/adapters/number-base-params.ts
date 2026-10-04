import {
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

import type { NumberBase } from './number-base';
import { normalizeBase } from './number-base';

export interface NumberBaseSearchParams {
  from?: string;
  input?: string;
}

export function buildNumberBaseParams(
  input: string,
  fromBase: NumberBase
): URLSearchParams {
  return recordToSearchParams({
    from: fromBase === 10 ? undefined : String(fromBase),
    input: trimmed(input),
  });
}

export function buildNumberBaseStateFromSearch(
  search: NumberBaseSearchParams
): {
  fromBase: NumberBase;
  input: string;
} {
  return {
    fromBase: normalizeBase(search.from),
    input: readString(search.input),
  };
}
