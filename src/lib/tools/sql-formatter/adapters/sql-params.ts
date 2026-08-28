import type { SqlDialect } from './sql-formatter';

export type SqlSearchAction = 'format' | 'minify';

const ALLOWED_DIALECTS: ReadonlySet<string> = new Set<string>([
  'bigquery',
  'mysql',
  'postgresql',
  'sqlite',
  'sql',
  'transactsql',
]);

const ALLOWED_ACTIONS: ReadonlySet<string> = new Set<string>([
  'format',
  'minify',
]);

const DEFAULT_DIALECT: SqlDialect = 'sql';
const DEFAULT_ACTION: SqlSearchAction = 'format';

function coerceDialect(value: unknown): SqlDialect {
  if (typeof value === 'string' && ALLOWED_DIALECTS.has(value)) {
    return value as SqlDialect;
  }
  return DEFAULT_DIALECT;
}

function coerceAction(value: unknown): SqlSearchAction {
  if (typeof value === 'string' && ALLOWED_ACTIONS.has(value)) {
    return value as SqlSearchAction;
  }
  return DEFAULT_ACTION;
}

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
  const input = typeof search.input === 'string' ? search.input : '';
  const dialect = coerceDialect(search.dialect);
  const action = coerceAction(search.action);
  return { action, dialect, input };
}
