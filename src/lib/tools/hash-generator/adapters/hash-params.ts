import type { HashAlgorithm } from './hash-generator';
import { HASH_ALGORITHMS } from './hash-generator';

export interface HashSearchParams {
  algorithm?: string;
  text?: string;
}

export function buildHashParams(
  text: string,
  algorithm: HashAlgorithm
): URLSearchParams {
  const params = new URLSearchParams();
  if (text.trim()) {
    params.set('text', text);
  }
  if (algorithm && algorithm !== 'SHA-256') {
    params.set('algorithm', algorithm);
  }
  return params;
}

export function buildHashStateFromSearch(search: HashSearchParams): {
  algorithm: HashAlgorithm;
  text: string;
} {
  const algorithm = HASH_ALGORITHMS.includes(search.algorithm as HashAlgorithm)
    ? (search.algorithm as HashAlgorithm)
    : 'SHA-256';
  return { algorithm, text: search.text ?? '' };
}
