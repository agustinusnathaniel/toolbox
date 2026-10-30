import { readString, recordToSearchParams } from '@/lib/utils/search-params';

import { DEFAULT_CHMOD_OCTAL, octalToBits } from './chmod-calculator';

export interface ChmodCalculatorSearchParams {
  mode?: string;
}

export interface ChmodCalculatorState {
  mode: string;
}

export function buildChmodCalculatorParams(
  state: ChmodCalculatorState
): URLSearchParams {
  return recordToSearchParams({
    mode: state.mode === DEFAULT_CHMOD_OCTAL ? undefined : state.mode,
  });
}

export function buildChmodCalculatorStateFromSearch(
  search: ChmodCalculatorSearchParams
): ChmodCalculatorState {
  const mode = readString(search.mode, DEFAULT_CHMOD_OCTAL);
  return {
    mode: octalToBits(mode) === null ? DEFAULT_CHMOD_OCTAL : mode.trim(),
  };
}
