import type { UrlCodecDirection, UrlCodecMode } from './url-codec';

export interface UrlCodecSearchParams {
  direction?: string;
  input?: string;
  mode?: string;
}

export interface UrlCodecState {
  direction: UrlCodecDirection;
  input: string;
  mode: UrlCodecMode;
}

export function buildUrlCodecParams(state: UrlCodecState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.input.trim()) {
    params.set('input', state.input);
  }
  if (state.direction !== 'encode') {
    params.set('direction', state.direction);
  }
  if (state.mode !== 'component') {
    params.set('mode', state.mode);
  }
  return params;
}

export function buildUrlCodecStateFromSearch(
  search: UrlCodecSearchParams
): UrlCodecState {
  return {
    direction: search.direction === 'decode' ? 'decode' : 'encode',
    input: search.input ?? '',
    mode: search.mode === 'full' ? 'full' : 'component',
  };
}
