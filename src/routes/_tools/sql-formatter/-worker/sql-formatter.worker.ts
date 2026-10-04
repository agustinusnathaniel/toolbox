import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  formatSql,
  minifySql,
  type SqlDialect,
} from '@/lib/tools/sql-formatter/adapters/sql-formatter';
import type { SqlSearchAction } from '@/lib/tools/sql-formatter/adapters/sql-params';
import type { TransformResult } from '@/lib/utils/transform';

export type SqlFormatterRequest = WorkerRequest<{
  action: SqlSearchAction;
  dialect: SqlDialect;
  input: string;
}>;

export type SqlFormatterResponse = WorkerResponse<
  TransformResult & { timedOut?: boolean }
>;

self.onmessage = (event: MessageEvent<SqlFormatterRequest>) => {
  const { id, input, dialect, action } = event.data;
  let result: TransformResult;
  if (action === 'minify') {
    result = minifySql(input, dialect);
  } else {
    result = formatSql(input, dialect);
  }
  const response: SqlFormatterResponse = { id, result };
  self.postMessage(response);
};
