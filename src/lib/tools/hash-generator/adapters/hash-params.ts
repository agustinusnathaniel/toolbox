import {
  coerceEnum,
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

import type { HashAlgorithm } from './hash-generator';
import { HASH_ALGORITHMS } from './hash-generator';

export interface HashSearchParams {
  algorithm?: string;
  expected?: string;
  text?: string;
}

const HASH_ALGORITHM_SET: ReadonlySet<HashAlgorithm> = new Set(HASH_ALGORITHMS);
const DEFAULT_ALGORITHM: HashAlgorithm = 'SHA-256';

export function buildHashParams(
  text: string,
  algorithm: HashAlgorithm,
  expected = ''
): URLSearchParams {
  return recordToSearchParams({
    algorithm: algorithm === 'SHA-256' ? undefined : algorithm,
    expected: trimmed(expected),
    text: trimmed(text),
  });
}

export function buildHashStateFromSearch(search: HashSearchParams): {
  algorithm: HashAlgorithm;
  expected: string;
  text: string;
} {
  return {
    algorithm: coerceEnum(
      search.algorithm,
      HASH_ALGORITHM_SET,
      DEFAULT_ALGORITHM
    ),
    expected: readString(search.expected),
    text: readString(search.text),
  };
}
