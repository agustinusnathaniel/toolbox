import { coerceEnum, readString } from '@/lib/utils/search-params';

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
  const params = new URLSearchParams();
  if (input !== '') {
    params.set('input', input);
  }
  params.set('dialect', dialect);
  params.set('action', action);
  return params;
}

export function buildSqlStateFromSearch(search: Record<string, unknown>): {
  action: SqlSearchAction;
  dialect: SqlDialect;
  input: string;
} {
  const input = readString(search.input);
  const dialect = coerceEnum(search.dialect, ALLOWED_DIALECTS, DEFAULT_DIALECT);
  const action = coerceEnum(search.action, ALLOWED_ACTIONS, DEFAULT_ACTION);
  return { action, dialect, input };
}
