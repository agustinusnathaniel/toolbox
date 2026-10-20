import {
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

export interface UrlInspectorSearchParams {
  input?: string;
}

export interface UrlInspectorState {
  input: string;
}

export function buildUrlInspectorParams(
  state: UrlInspectorState
): URLSearchParams {
  return recordToSearchParams({ input: trimmed(state.input) });
}

export function buildUrlInspectorStateFromSearch(
  search: UrlInspectorSearchParams
): UrlInspectorState {
  return { input: readString(search.input) };
}
