import { format } from 'sql-formatter';

export type SqlDialect =
  | 'bigquery'
  | 'mysql'
  | 'postgresql'
  | 'sqlite'
  | 'sql'
  | 'transactsql';

export interface SqlFormatterResult {
  error?: string;
  formatted: string;
  isValid: boolean;
}

export function formatSql(
  input: string,
  dialect: SqlDialect
): SqlFormatterResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: 'Input is empty', formatted: '', isValid: false };
  }
  try {
    const formatted = format(trimmed, {
      keywordCase: 'upper',
      language: dialect,
    });
    return { formatted, isValid: true };
  } catch (e) {
    return {
      error: (e as Error).message,
      formatted: '',
      isValid: false,
    };
  }
}

export function minifySql(
  input: string,
  dialect: SqlDialect
): SqlFormatterResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: 'Input is empty', formatted: '', isValid: false };
  }
  try {
    const formatted = format(trimmed, {
      keywordCase: 'upper',
      language: dialect,
    });
    const minified = formatted.replaceAll(/\s+/g, ' ').trim();
    return { formatted: minified, isValid: true };
  } catch (e) {
    return {
      error: (e as Error).message,
      formatted: '',
      isValid: false,
    };
  }
}
