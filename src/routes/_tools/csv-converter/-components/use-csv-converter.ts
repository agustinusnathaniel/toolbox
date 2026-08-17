'use client';

import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { useWorkerDeadline } from '@/lib/hooks/use-worker-deadline';
import type {
  CsvConverterResult,
  CsvMode,
} from '@/lib/tools/csv-converter/adapters/csv-converter';

import type {
  CsvConverterRequest,
  CsvConverterResponse,
} from '../-worker/csv-converter.worker';
import CsvConverterWorker from '../-worker/csv-converter.worker.ts?worker';

export const CSV_CONVERTER_EXECUTION_DEADLINE_MS = 2000;
export const CSV_CONVERTER_TIMEOUT_ERROR =
  'Conversion took too long — the input is too large. Try a smaller file.';

const TIMEOUT_RESULT: CsvConverterResult & { timedOut: true } = {
  error: CSV_CONVERTER_TIMEOUT_ERROR,
  isValid: true,
  output: '',
  timedOut: true,
};

export type CsvConverterState = CsvConverterResult & { timedOut?: boolean };

export interface UseCsvConverterReturn {
  computing: boolean;
  result: CsvConverterState | null;
  setResult: Dispatch<SetStateAction<CsvConverterState | null>>;
}

export function useCsvConverter(
  input: string,
  mode: CsvMode,
  trigger: number,
  workerFactory: () => Worker = () => new CsvConverterWorker()
): UseCsvConverterReturn {
  const { computing, result, setResult, postRequest } = useWorkerDeadline<
    CsvConverterRequest,
    CsvConverterResponse,
    CsvConverterState
  >({
    buildRequest: (id) => ({ id, input, mode }),
    deadlineMs: CSV_CONVERTER_EXECUTION_DEADLINE_MS,
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
