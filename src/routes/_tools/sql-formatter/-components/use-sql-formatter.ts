'use client';

import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { useWorkerDeadline } from '@/lib/hooks/use-worker-deadline';
import type { SqlDialect } from '@/lib/tools/sql-formatter/adapters/sql-formatter';
import type { SqlSearchAction } from '@/lib/tools/sql-formatter/adapters/sql-params';
import type { TransformResult } from '@/lib/utils/transform';

import type {
  SqlFormatterRequest,
  SqlFormatterResponse,
} from '../-worker/sql-formatter.worker';
import SqlFormatterWorker from '../-worker/sql-formatter.worker.ts?worker';

export const SQL_FORMATTER_TIMEOUT_ERROR =
  'Formatting took too long — the input is too large. Try a smaller file.';

const TIMEOUT_RESULT: TransformResult & { timedOut: true } = {
  error: SQL_FORMATTER_TIMEOUT_ERROR,
  isValid: false,
  output: '',
  timedOut: true,
};

type SqlFormatterState = TransformResult & { timedOut?: boolean };

export interface UseSqlFormatterReturn {
  computing: boolean;
  result: SqlFormatterState | null;
  setResult: Dispatch<SetStateAction<SqlFormatterState | null>>;
}

export function useSqlFormatter(
  input: string,
  dialect: SqlDialect,
  action: SqlSearchAction,
  trigger: number,
  workerFactory: () => Worker = () => new SqlFormatterWorker()
): UseSqlFormatterReturn {
  const { computing, result, setResult, postRequest } = useWorkerDeadline<
    SqlFormatterRequest,
    SqlFormatterResponse,
    SqlFormatterState
  >({
    buildRequest: (id) => ({
      action,
      dialect,
      id,
      input,
    }),
    extractId: (response) => response.id,
    extractResult: (response) => response.result,
    timeoutResult: TIMEOUT_RESULT,
    workerFactory,
  });

  // Re-posts on input/dialect/action change so formatting recomputes live
  // once the first explicit run happened; trigger alone drives nothing.
  // biome-ignore lint/correctness/useExhaustiveDependencies: input/dialect/action captured via buildRequest closure, trigger drives execution
  useEffect(() => {
    if (trigger <= 0) {
      return;
    }
    if (!input.trim()) {
      setResult(null);
      return;
    }
    postRequest();
  }, [input, dialect, action, postRequest, setResult, trigger]);

  return { computing, result, setResult };
}
