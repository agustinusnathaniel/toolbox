import {
  coerceEnum,
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

import type { CsvMode } from './csv-converter';

export interface CsvSearchParams {
  input?: string;
  mode?: string;
}

const ALLOWED_MODES: ReadonlySet<CsvMode> = new Set<CsvMode>([
  'csv-to-json',
  'json-to-csv',
]);
const DEFAULT_MODE: CsvMode = 'csv-to-json';

export function buildCsvParams(options: {
  input: string;
  mode: CsvMode;
}): URLSearchParams {
  return recordToSearchParams({
    input: trimmed(options.input),
    mode: options.mode === 'csv-to-json' ? undefined : options.mode,
  });
}

export function buildCsvStateFromSearch(search: CsvSearchParams): {
  input: string;
  mode: CsvMode;
} {
  return {
    input: readString(search.input),
    mode: coerceEnum(search.mode, ALLOWED_MODES, DEFAULT_MODE),
  };
}
