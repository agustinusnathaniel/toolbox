import type { HtmlEntitiesMode } from './html-entities';

export interface HtmlEntitiesSearchParams {
  input?: string;
  mode?: string;
}

export interface HtmlEntitiesState {
  input: string;
  mode: HtmlEntitiesMode;
}

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
  const rawInput = search.input;
  const rawMode = search.mode;
  return {
    input: typeof rawInput === 'string' ? rawInput : '',
    mode: rawMode === 'decode' ? 'decode' : 'encode',
  };
}
