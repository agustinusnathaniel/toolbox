import { format } from 'sql-formatter';

import { runTransform, type TransformResult } from '@/lib/utils/transform';

export type SqlDialect =
  | 'bigquery'
  | 'mysql'
  | 'postgresql'
  | 'sqlite'
  | 'sql'
  | 'transactsql';

export function formatSql(input: string, dialect: SqlDialect): TransformResult {
  return runTransform(input, (trimmed) =>
    format(trimmed, {
      keywordCase: 'upper',
      language: dialect,
    })
  );
}

export function minifySql(input: string, dialect: SqlDialect): TransformResult {
  return runTransform(input, (trimmed) =>
    format(trimmed, { keywordCase: 'upper', language: dialect })
      .replaceAll(/\s+/g, ' ')
      .trim()
  );
}
