import { coerceEnum, readString } from '@/lib/utils/search-params';

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
  const params = new URLSearchParams();
  if (options.input) {
    params.set('input', options.input);
  }
  if (options.mode !== 'csv-to-json') {
    params.set('mode', options.mode);
  }
  return params;
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
