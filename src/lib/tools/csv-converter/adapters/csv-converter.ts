import Papa from 'papaparse';

export type CsvMode = 'csv-to-json' | 'json-to-csv';

export interface CsvConverterResult {
  error?: string;
  isValid: boolean;
  output: string;
}

export function csvToJson(input: string): CsvConverterResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: 'Input is empty', isValid: false, output: '' };
  }
  const parsed = Papa.parse<Record<string, string>>(trimmed, {
    dynamicTyping: false,
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length > 0) {
    return {
      error: parsed.errors[0]?.message ?? 'Invalid CSV',
      isValid: false,
      output: '',
    };
  }
  if (parsed.data.length === 0) {
    return { error: 'No rows found in CSV', isValid: false, output: '' };
  }
  return { isValid: true, output: JSON.stringify(parsed.data, null, 2) };
}

export function jsonToCsv(input: string): CsvConverterResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: 'Input is empty', isValid: false, output: '' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return { error: (e as Error).message, isValid: false, output: '' };
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return {
      error: 'JSON must be a non-empty array',
      isValid: false,
      output: '',
    };
  }
  if (
    parsed.some(
      (row) => typeof row !== 'object' || row === null || Array.isArray(row)
    )
  ) {
    return {
      error: 'JSON array items must be objects',
      isValid: false,
      output: '',
    };
  }
  const rows = parsed as Array<Record<string, unknown>>;
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const csv = Papa.unparse(
    rows.map((row) => {
      const flat: Record<string, string> = {};
      for (const key of keys) {
        const value = row[key];
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          flat[key] = String(value);
        } else if (value === null || value === undefined) {
          flat[key] = '';
        } else {
          flat[key] = JSON.stringify(value);
        }
      }
      return flat;
    }),
    { header: true }
  );
  return { isValid: true, output: csv };
}
