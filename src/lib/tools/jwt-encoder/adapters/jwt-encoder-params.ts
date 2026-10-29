import {
  coerceEnum,
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

import { JWT_ENCODER_ALG_SET, type JwtEncoderAlg } from './jwt-encoder';

export interface JwtEncoderSearchParams {
  alg?: string;
  header?: string;
  payload?: string;
}

export interface JwtEncoderState {
  alg: JwtEncoderAlg;
  header: string;
  payload: string;
}

const DEFAULT_ALG: JwtEncoderAlg = 'HS256';

// The secret is deliberately excluded: share links must never carry it.
export function buildJwtEncoderParams(state: JwtEncoderState): URLSearchParams {
  return recordToSearchParams({
    alg: state.alg === DEFAULT_ALG ? undefined : state.alg,
    header: trimmed(state.header),
    payload: trimmed(state.payload),
  });
}

export function buildJwtEncoderStateFromSearch(
  search: JwtEncoderSearchParams
): JwtEncoderState {
  return {
    alg: coerceEnum(search.alg, JWT_ENCODER_ALG_SET, DEFAULT_ALG),
    header: readString(search.header),
    payload: readString(search.payload),
  };
}
