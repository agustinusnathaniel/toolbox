import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  formatSql,
  minifySql,
  type SqlDialect,
  type SqlFormatterResult,
} from '@/lib/tools/sql-formatter/adapters/sql-formatter';
import type { SqlSearchAction } from '@/lib/tools/sql-formatter/adapters/sql-params';

export type SqlFormatterRequest = WorkerRequest<{
  action: SqlSearchAction;
  dialect: SqlDialect;
  input: string;
}>;

export type SqlFormatterResponse = WorkerResponse<
  SqlFormatterResult & { timedOut?: boolean }
>;

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
