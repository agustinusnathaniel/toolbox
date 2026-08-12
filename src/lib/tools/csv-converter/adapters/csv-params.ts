import type { CsvMode } from './csv-converter';

export interface CsvSearchParams {
  input?: string;
  mode?: string;
}

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
  const mode: CsvMode =
    search.mode === 'json-to-csv' ? 'json-to-csv' : 'csv-to-json';
  return { input: search.input ?? '', mode };
}
