'use client';

import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { useWorkerDeadline } from '@/lib/hooks/use-worker-deadline';
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
  fileDiff: null,
  isValid: true,
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
  const { computing, result, setResult, postRequest } = useWorkerDeadline<
    TextDiffRequest,
    TextDiffResponse,
    TextDiffResult
  >({
    buildRequest: (id) => ({ id, modified, original }),
    deadlineMs: TEXT_DIFF_EXECUTION_DEADLINE_MS,
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
