import { coerceEnum, readString } from '@/lib/utils/search-params';

import type { HtmlEntitiesMode } from './html-entities';

export interface HtmlEntitiesState {
  input: string;
  mode: HtmlEntitiesMode;
}

const ALLOWED_MODES: ReadonlySet<HtmlEntitiesMode> = new Set<HtmlEntitiesMode>([
  'decode',
  'encode',
]);
const DEFAULT_MODE: HtmlEntitiesMode = 'encode';

export function buildHtmlEntitiesParams(
  input: string,
  mode: string
): URLSearchParams {
  const params = new URLSearchParams();
  if (input.trim()) {
    params.set('input', input);
  }
  if (mode === 'decode') {
    params.set('mode', 'decode');
  }
  return params;
}

export function buildHtmlEntitiesStateFromSearch(
  search: Record<string, unknown>
): HtmlEntitiesState {
  return {
    input: readString(search.input),
    mode: coerceEnum(search.mode, ALLOWED_MODES, DEFAULT_MODE),
  };
}
