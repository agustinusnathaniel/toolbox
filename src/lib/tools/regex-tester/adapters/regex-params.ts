import {
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

export interface RegexSearchParams {
  flags?: string;
  input?: string;
  pattern?: string;
}

export function buildRegexParams(
  pattern: string,
  flags: string,
  input: string
): URLSearchParams {
  return recordToSearchParams({
    flags: trimmed(flags),
    input: trimmed(input),
    pattern: trimmed(pattern),
  });
}

export function buildRegexStateFromSearch(search: RegexSearchParams): {
  pattern: string;
  flags: string;
  input: string;
} {
  return {
    flags: readString(search.flags),
    input: readString(search.input),
    pattern: readString(search.pattern),
  };
}
