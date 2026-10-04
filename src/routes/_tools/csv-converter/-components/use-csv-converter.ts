'use client';

import type { Dispatch, SetStateAction } from 'react';

import {
  useWorkerDeadline,
  useWorkerTrigger,
} from '@/lib/hooks/use-worker-deadline';
import type { CsvMode } from '@/lib/tools/csv-converter/adapters/csv-converter';
import type { TransformResult } from '@/lib/utils/transform';

import type {
  CsvConverterRequest,
  CsvConverterResponse,
} from '../-worker/csv-converter.worker';
import CsvConverterWorker from '../-worker/csv-converter.worker.ts?worker';

export const CSV_CONVERTER_TIMEOUT_ERROR =
  'Conversion took too long — the input is too large. Try a smaller file.';

const TIMEOUT_RESULT: TransformResult & { timedOut: true } = {
  error: CSV_CONVERTER_TIMEOUT_ERROR,
  isValid: true,
  output: '',
  timedOut: true,
};

type CsvConverterState = TransformResult & { timedOut?: boolean };

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
    extractId: (response) => response.id,
    extractResult: (response) => response.result,
    timeoutResult: TIMEOUT_RESULT,
    workerFactory,
  });

  useWorkerTrigger(postRequest, trigger);

  return { computing, result, setResult };
}
