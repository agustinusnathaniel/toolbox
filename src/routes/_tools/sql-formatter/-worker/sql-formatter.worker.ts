import {
  formatSql,
  minifySql,
  type SqlFormatterResult,
} from '@/lib/tools/sql-formatter/adapters/sql-formatter';

export type SqlDialect =
  | 'bigquery'
  | 'mysql'
  | 'postgresql'
  | 'sqlite'
  | 'sql'
  | 'transactsql';

export type SqlSearchAction = 'format' | 'minify';

export interface SqlFormatterRequest {
  action: SqlSearchAction;
  dialect: SqlDialect;
  id: string;
  input: string;
}

export interface SqlFormatterResponse {
  id: string;
  result: SqlFormatterResult & { timedOut?: boolean };
}

self.onmessage = (event: MessageEvent<SqlFormatterRequest>) => {
  const { id, input, dialect, action } = event.data;
  let result: SqlFormatterResult;
  if (action === 'minify') {
    result = minifySql(input, dialect);
  } else {
    result = formatSql(input, dialect);
  }
  const response: SqlFormatterResponse = { id, result };
  self.postMessage(response);
};
