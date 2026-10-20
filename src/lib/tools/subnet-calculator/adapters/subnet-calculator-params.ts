import {
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

export interface SubnetCalculatorSearchParams {
  input?: string;
}

export interface SubnetCalculatorState {
  input: string;
}

export function buildSubnetCalculatorParams(
  state: SubnetCalculatorState
): URLSearchParams {
  return recordToSearchParams({ input: trimmed(state.input) });
}

export function buildSubnetCalculatorStateFromSearch(
  search: SubnetCalculatorSearchParams
): SubnetCalculatorState {
  return { input: readString(search.input) };
}
