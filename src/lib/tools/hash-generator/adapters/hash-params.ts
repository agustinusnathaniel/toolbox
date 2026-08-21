import type { HashAlgorithm } from './hash-generator';
import { HASH_ALGORITHMS } from './hash-generator';

export interface HashSearchParams {
  algorithm?: string;
  expected?: string;
  text?: string;
}

export function buildHashParams(
  text: string,
  algorithm: HashAlgorithm,
  expected = ''
): URLSearchParams {
  const params = new URLSearchParams();
  if (text.trim()) {
    params.set('text', text);
  }
  if (algorithm && algorithm !== 'SHA-256') {
    params.set('algorithm', algorithm);
  }
  if (expected.trim()) {
    params.set('expected', expected);
  }
  return params;
}

export function buildHashStateFromSearch(search: HashSearchParams): {
  algorithm: HashAlgorithm;
  expected: string;
  text: string;
} {
  const algorithm = HASH_ALGORITHMS.includes(search.algorithm as HashAlgorithm)
    ? (search.algorithm as HashAlgorithm)
    : 'SHA-256';
  return {
    algorithm,
    expected: search.expected ?? '',
    text: search.text ?? '',
  };
}
