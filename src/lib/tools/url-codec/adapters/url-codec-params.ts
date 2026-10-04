import {
  coerceEnum,
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

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
  return recordToSearchParams({
    direction: state.direction === 'encode' ? undefined : state.direction,
    input: trimmed(state.input),
    mode: state.mode === 'component' ? undefined : state.mode,
  });
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
