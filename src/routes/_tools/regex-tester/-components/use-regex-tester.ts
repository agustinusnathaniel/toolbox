'use client';

import { useEffect } from 'react';

import { useWorkerDeadline } from '@/lib/hooks/use-worker-deadline';
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
  const { result, postRequest } = useWorkerDeadline<
    RegexTesterRequest,
    RegexTesterResponse,
    RegexTestResult
  >({
    buildRequest: (id) => ({ flags, id, input, pattern }),
    deadlineMs: REGEX_EXECUTION_DEADLINE_MS,
    extractId: (response) => response.id,
    extractResult: (response) => response.result,
    timeoutResult: TIMEOUT_RESULT,
    workerFactory,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: params are captured by the buildRequest closure; they are listed to re-arm the debounce timer
  useEffect(() => {
    const timeout = setTimeout(() => {
      postRequest();
    }, REGEX_DEBOUNCE_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [flags, input, pattern, postRequest]);

  return { result: result ?? EMPTY_RESULT };
}
