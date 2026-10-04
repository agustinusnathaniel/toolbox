import {
  coerceEnum,
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

import type { SqlDialect } from './sql-formatter';

export type SqlSearchAction = 'format' | 'minify';

const ALLOWED_DIALECTS: ReadonlySet<SqlDialect> = new Set<SqlDialect>([
  'bigquery',
  'mysql',
  'postgresql',
  'sqlite',
  'sql',
  'transactsql',
]);

const ALLOWED_ACTIONS: ReadonlySet<SqlSearchAction> = new Set<SqlSearchAction>([
  'format',
  'minify',
]);

const DEFAULT_DIALECT: SqlDialect = 'sql';
const DEFAULT_ACTION: SqlSearchAction = 'format';

export function buildSqlParams(
  input: string,
  dialect: SqlDialect,
  action: SqlSearchAction
): URLSearchParams {
  return recordToSearchParams({
    action,
    dialect,
    input: trimmed(input),
  });
}

export function buildSqlStateFromSearch(search: Record<string, unknown>): {
  action: SqlSearchAction;
  dialect: SqlDialect;
  input: string;
} {
  return {
    action: coerceEnum(search.action, ALLOWED_ACTIONS, DEFAULT_ACTION),
    dialect: coerceEnum(search.dialect, ALLOWED_DIALECTS, DEFAULT_DIALECT),
    input: readString(search.input),
  };
}
