'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { RegexTestResult } from '@/lib/tools/regex-tester/adapters/regex';

import type {
  RegexTesterRequest,
  RegexTesterResponse,
} from '../-worker/regex-tester.worker';
import RegexTesterWorker from '../-worker/regex-tester.worker.ts?worker';

export const REGEX_EXECUTION_DEADLINE_MS = 2000;
export const REGEX_DEBOUNCE_MS = 150;

const EMPTY_RESULT: RegexTestResult = {
  isValid: true,
  matchCount: 0,
  matches: [],
};

const TIMEOUT_RESULT: RegexTestResult = {
  error:
    'Pattern took too long to evaluate — this usually means catastrophic backtracking. Try simplifying the pattern or using shorter input.',
  isValid: true,
  matchCount: 0,
  matches: [],
  timedOut: true,
};

export interface UseRegexTesterReturn {
  result: RegexTestResult;
}

export function useRegexTester(
  pattern: string,
  flags: string,
  input: string,
  workerFactory: () => Worker = () => new RegexTesterWorker()
): UseRegexTesterReturn {
  const workerFactoryRef = useRef(workerFactory);
  workerFactoryRef.current = workerFactory;

  const workerRef = useRef<Worker | null>(null);
  const latestIdRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [result, setResult] = useState<RegexTestResult>(EMPTY_RESULT);

  const clearDebounce = useCallback(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const clearDeadline = useCallback(() => {
    if (deadlineRef.current !== null) {
      clearTimeout(deadlineRef.current);
      deadlineRef.current = null;
    }
  }, []);

  const attachWorker = useCallback(
    (worker: Worker) => {
      worker.onmessage = (event: MessageEvent<RegexTesterResponse>) => {
        if (event.data.id !== latestIdRef.current) {
          return;
        }
        clearDeadline();
        setResult(event.data.result);
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
  }, [attachWorker]);

  useEffect(() => {
    const worker = workerFactoryRef.current();
    attachWorker(worker);

    return () => {
      clearDebounce();
      clearDeadline();
      workerRef.current?.terminate();
      workerRef.current = null;
      latestIdRef.current = null;
    };
  }, [attachWorker, clearDeadline, clearDebounce]);

  useEffect(() => {
    clearDebounce();
    debounceRef.current = setTimeout(() => {
      clearDebounce();
      clearDeadline();
      const id = crypto.randomUUID();
      latestIdRef.current = id;
      const request: RegexTesterRequest = { flags, id, input, pattern };
      workerRef.current?.postMessage(request);
      deadlineRef.current = setTimeout(
        handleTimeout,
        REGEX_EXECUTION_DEADLINE_MS
      );
    }, REGEX_DEBOUNCE_MS);

    return () => {
      clearDebounce();
      clearDeadline();
    };
  }, [clearDeadline, clearDebounce, flags, handleTimeout, input, pattern]);

  return { result };
}
