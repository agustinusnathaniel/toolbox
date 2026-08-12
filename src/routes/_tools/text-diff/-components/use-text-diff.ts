'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { TextDiffResult } from '@/lib/tools/text-diff/adapters/text-diff';

import type {
  TextDiffRequest,
  TextDiffResponse,
} from '../-worker/text-diff.worker';
import TextDiffWorker from '../-worker/text-diff.worker.ts?worker';

export const TEXT_DIFF_EXECUTION_DEADLINE_MS = 2000;
export const TEXT_DIFF_TIMEOUT_ERROR =
  'Comparison took too long — the input is too large or the two texts are too different. Try shorter inputs.';

const TIMEOUT_RESULT: TextDiffResult = {
  addedCount: 0,
  error: TEXT_DIFF_TIMEOUT_ERROR,
  isValid: true,
  lines: [],
  removedCount: 0,
  timedOut: true,
};

export interface UseTextDiffReturn {
  computing: boolean;
  result: TextDiffResult | null;
  setResult: Dispatch<SetStateAction<TextDiffResult | null>>;
}

export function useTextDiff(
  original: string,
  modified: string,
  trigger: number,
  workerFactory: () => Worker = () => new TextDiffWorker()
): UseTextDiffReturn {
  const workerFactoryRef = useRef(workerFactory);
  workerFactoryRef.current = workerFactory;

  const workerRef = useRef<Worker | null>(null);
  const latestIdRef = useRef<string | null>(null);
  const deadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [result, setResult] = useState<TextDiffResult | null>(null);
  const [computing, setComputing] = useState(false);

  const clearDeadline = useCallback(() => {
    if (deadlineRef.current !== null) {
      clearTimeout(deadlineRef.current);
      deadlineRef.current = null;
    }
  }, []);

  const attachWorker = useCallback(
    (worker: Worker) => {
      worker.onmessage = (event: MessageEvent<TextDiffResponse>) => {
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
    const request: TextDiffRequest = { id, modified, original };
    workerRef.current?.postMessage(request);
    setComputing(true);
    deadlineRef.current = setTimeout(
      handleTimeout,
      TEXT_DIFF_EXECUTION_DEADLINE_MS
    );

    return () => {
      clearDeadline();
    };
  }, [clearDeadline, handleTimeout, modified, original, trigger]);

  return { computing, result, setResult };
}
