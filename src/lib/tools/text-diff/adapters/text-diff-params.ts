import {
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

export interface TextDiffSearchParams {
  modified?: string;
  original?: string;
}

export function buildTextDiffParams(
  original: string,
  modified: string
): URLSearchParams {
  return recordToSearchParams({
    modified: trimmed(modified),
    original: trimmed(original),
  });
}

export function buildTextDiffStateFromSearch(search: TextDiffSearchParams): {
  original: string;
  modified: string;
} {
  return {
    modified: readString(search.modified),
    original: readString(search.original),
  };
}
