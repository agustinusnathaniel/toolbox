import { coerceEnum, readString } from '@/lib/utils/search-params';

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

const ALLOWED_DIRECTIONS: ReadonlySet<UrlCodecDirection> =
  new Set<UrlCodecDirection>(['decode', 'encode']);
const ALLOWED_MODES: ReadonlySet<UrlCodecMode> = new Set<UrlCodecMode>([
  'component',
  'full',
]);

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
    direction: coerceEnum(search.direction, ALLOWED_DIRECTIONS, 'encode'),
    input: readString(search.input),
    mode: coerceEnum(search.mode, ALLOWED_MODES, 'component'),
  };
}
