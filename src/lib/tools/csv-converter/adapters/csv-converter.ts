import Papa from 'papaparse';

import { runTransform, type TransformResult } from '@/lib/utils/transform';

export type CsvMode = 'csv-to-json' | 'json-to-csv';

export function csvToJson(input: string): TransformResult {
  return runTransform(input, (trimmed) => {
    const parsed = Papa.parse<Record<string, string>>(trimmed, {
      dynamicTyping: false,
      header: true,
      skipEmptyLines: true,
    });
    if (parsed.errors.length > 0) {
      throw new Error(parsed.errors[0]?.message ?? 'Invalid CSV');
    }
    if (parsed.data.length === 0) {
      throw new Error('No rows found in CSV');
    }
    return JSON.stringify(parsed.data, null, 2);
  });
}

export function jsonToCsv(input: string): TransformResult {
  return runTransform(input, (trimmed) => {
    const parsed: unknown = JSON.parse(trimmed);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('JSON must be a non-empty array');
    }
    if (
      parsed.some(
        (row) => typeof row !== 'object' || row === null || Array.isArray(row)
      )
    ) {
      throw new Error('JSON array items must be objects');
    }
    const rows = parsed as Array<Record<string, unknown>>;
    const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    return Papa.unparse(
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
  });
}
