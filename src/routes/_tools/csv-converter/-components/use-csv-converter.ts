'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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
  const workerFactoryRef = useRef(workerFactory);
  workerFactoryRef.current = workerFactory;

  const workerRef = useRef<Worker | null>(null);
  const latestIdRef = useRef<string | null>(null);
  const deadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [result, setResult] = useState<CsvConverterState | null>(null);
  const [computing, setComputing] = useState(false);

  const clearDeadline = useCallback(() => {
    if (deadlineRef.current !== null) {
      clearTimeout(deadlineRef.current);
      deadlineRef.current = null;
    }
  }, []);

  const attachWorker = useCallback(
    (worker: Worker) => {
      worker.onmessage = (event: MessageEvent<CsvConverterResponse>) => {
        if (event.data.id !== latestIdRef.current) {
          return;
        }
        clearDeadline();
        setResult(event.data.result);
        setComputing(false);
      };
      workerRef.current = worker;
    },
    [clearDeadline]
  );

  const handleTimeout = useCallback(() => {
    workerRef.current?.terminate();
    latestIdRef.current = null;
    const replacement = workerFactoryRef.current();
    attachWorker(replacement);
    setResult(TIMEOUT_RESULT);
    setComputing(false);
  }, [attachWorker]);

  useEffect(() => {
    const worker = workerFactoryRef.current();
    attachWorker(worker);

    return () => {
      clearDeadline();
      workerRef.current?.terminate();
      workerRef.current = null;
      latestIdRef.current = null;
    };
  }, [attachWorker, clearDeadline]);

  useEffect(() => {
    if (trigger <= 0) {
      return;
    }
    clearDeadline();
    const id = crypto.randomUUID();
    latestIdRef.current = id;
    const request: CsvConverterRequest = { id, input, mode };
    workerRef.current?.postMessage(request);
    setComputing(true);
    deadlineRef.current = setTimeout(
      handleTimeout,
      CSV_CONVERTER_EXECUTION_DEADLINE_MS
    );

    return () => {
      clearDeadline();
    };
  }, [clearDeadline, handleTimeout, input, mode, trigger]);

  return { computing, result, setResult };
}
