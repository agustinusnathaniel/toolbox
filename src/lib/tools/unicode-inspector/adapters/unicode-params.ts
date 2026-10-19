import {
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

export interface UnicodeSearchParams {
  input?: string;
}

export function buildUnicodeParams(input: string): URLSearchParams {
  return recordToSearchParams({ input: trimmed(input) });
}

export function buildUnicodeStateFromSearch(search: UnicodeSearchParams): {
  input: string;
} {
  return { input: readString(search.input) };
}
