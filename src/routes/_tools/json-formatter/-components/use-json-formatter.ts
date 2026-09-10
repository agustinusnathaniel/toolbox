'use client';

import type { Dispatch, SetStateAction } from 'react';

import {
  useWorkerDeadline,
  useWorkerTrigger,
} from '@/lib/hooks/use-worker-deadline';
import type { JsonFormatterResult } from '@/lib/tools/json-formatter/adapters/json-formatter';

import type {
  JsonFormatterAction,
  JsonFormatterRequest,
  JsonFormatterResponse,
} from '../-worker/json-formatter.worker';
import JsonFormatterWorker from '../-worker/json-formatter.worker.ts?worker';

const JSON_FORMATTER_TIMEOUT_ERROR =
  'Formatting took too long — the input is too large. Try a smaller file.';

const TIMEOUT_RESULT: JsonFormatterResult & { timedOut: true } = {
  error: JSON_FORMATTER_TIMEOUT_ERROR,
  formatted: '',
  isValid: true,
  timedOut: true,
};

type JsonFormatterState = JsonFormatterResult & { timedOut?: boolean };

export interface UseJsonFormatterReturn {
  computing: boolean;
  result: JsonFormatterState | null;
  setResult: Dispatch<SetStateAction<JsonFormatterState | null>>;
}

export function useJsonFormatter(
  input: string,
  action: JsonFormatterAction | null,
  trigger: number,
  workerFactory: () => Worker = () => new JsonFormatterWorker()
): UseJsonFormatterReturn {
  const { computing, result, setResult, postRequest } = useWorkerDeadline<
    JsonFormatterRequest,
    JsonFormatterResponse,
    JsonFormatterState
  >({
    buildRequest: (id) => ({
      action: action as JsonFormatterAction,
      id,
      input,
    }),
    extractId: (response) => response.id,
    extractResult: (response) => response.result,
    timeoutResult: TIMEOUT_RESULT,
    workerFactory,
  });

  useWorkerTrigger(postRequest, trigger, action === null);

  return { computing, result, setResult };
}
