'use client';

import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { useWorkerDeadline } from '@/lib/hooks/use-worker-deadline';
import type { JsonToTsResult } from '@/lib/tools/json-to-ts/adapters/json-to-ts';

import type {
  JsonToTsRequest,
  JsonToTsResponse,
} from '../-worker/json-to-ts.worker';
import JsonToTsWorker from '../-worker/json-to-ts.worker.ts?worker';

export const JSON_TO_TS_EXECUTION_DEADLINE_MS = 2000;
export const JSON_TO_TS_TIMEOUT_ERROR =
  'Generation took too long — the input is too large or too deeply nested. Try smaller input.';

const TIMEOUT_RESULT: JsonToTsResult & { timedOut: true } = {
  error: JSON_TO_TS_TIMEOUT_ERROR,
  isValid: true,
  output: '',
  timedOut: true,
};

type JsonToTsState = JsonToTsResult & { timedOut?: boolean };

export interface UseJsonToTsReturn {
  computing: boolean;
  result: JsonToTsState | null;
  setResult: Dispatch<SetStateAction<JsonToTsState | null>>;
}

export function useJsonToTs(
  input: string,
  trigger: number,
  workerFactory: () => Worker = () => new JsonToTsWorker()
): UseJsonToTsReturn {
  const { computing, result, setResult, postRequest } = useWorkerDeadline<
    JsonToTsRequest,
    JsonToTsResponse,
    JsonToTsState
  >({
    buildRequest: (id) => ({ id, input }),
    deadlineMs: JSON_TO_TS_EXECUTION_DEADLINE_MS,
    extractId: (response) => response.id,
    extractResult: (response) => response.result,
    timeoutResult: TIMEOUT_RESULT,
    workerFactory,
  });

  useEffect(() => {
    if (trigger <= 0) {
      return;
    }
    postRequest();
  }, [postRequest, trigger]);

  return { computing, result, setResult };
}
