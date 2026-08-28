'use client';

import DOMPurify from 'dompurify';
import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { useWorkerDeadline } from '@/lib/hooks/use-worker-deadline';

import type {
  MarkdownPreviewRequest,
  MarkdownPreviewResponse,
} from '../-worker/markdown-preview.worker';
import MarkdownPreviewWorker from '../-worker/markdown-preview.worker.ts?worker';

export const MARKDOWN_PREVIEW_DEADLINE_MS = 2000;
export const MARKDOWN_PREVIEW_TIMEOUT_ERROR =
  'Rendering took too long — the input is too large. Try a smaller file.';

const TIMEOUT_RESULT: MarkdownPreviewState = {
  error: MARKDOWN_PREVIEW_TIMEOUT_ERROR,
  html: '',
  isEmpty: false,
  timedOut: true,
};

export type MarkdownPreviewState = {
  html: string;
  isEmpty: boolean;
  timedOut?: boolean;
  error?: string;
};

export interface UseMarkdownPreviewReturn {
  computing: boolean;
  result: MarkdownPreviewState | null;
  setResult: Dispatch<SetStateAction<MarkdownPreviewState | null>>;
}

export function useMarkdownPreview(
  input: string,
  trigger: number,
  workerFactory: () => Worker = () => new MarkdownPreviewWorker()
): UseMarkdownPreviewReturn {
  const { computing, result, setResult, postRequest } = useWorkerDeadline<
    MarkdownPreviewRequest,
    MarkdownPreviewResponse,
    MarkdownPreviewState
  >({
    buildRequest: (id) => ({ id, input }),
    deadlineMs: MARKDOWN_PREVIEW_DEADLINE_MS,
    extractId: (response) => response.id,
    extractResult: (response) => {
      const r = response.result;
      // Worker runs without DOM — DOMPurify unavailable there, so sanitize on main thread
      if (typeof window !== 'undefined' && r.html && !r.isEmpty) {
        return { ...r, html: DOMPurify.sanitize(r.html) };
      }
      return r;
    },
    timeoutResult: TIMEOUT_RESULT,
    workerFactory,
  });

  useEffect(() => {
    if (trigger <= 0) {
      return;
    }
    if (!input.trim()) {
      setResult({ html: '', isEmpty: true });
      return;
    }
    postRequest();
  }, [input, postRequest, setResult, trigger]);

  return { computing, result, setResult };
}
