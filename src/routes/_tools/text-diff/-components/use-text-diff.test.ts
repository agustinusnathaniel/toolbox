import { act, renderHook } from '@testing-library/react';
import type { Mock } from 'vite-plus/test';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import type {
  TextDiffRequest,
  TextDiffResponse,
} from '../-worker/text-diff.worker';
import {
  TEXT_DIFF_EXECUTION_DEADLINE_MS,
  TEXT_DIFF_TIMEOUT_ERROR,
  useTextDiff,
} from './use-text-diff';

interface FakeWorker {
  onmessage: ((event: MessageEvent<TextDiffResponse>) => void) | null;
  postMessage: Mock<(request: TextDiffRequest) => void>;
  terminate: Mock<() => void>;
}

function createFakeWorker(): FakeWorker {
  return {
    onmessage: null,
    postMessage: vi.fn<(request: TextDiffRequest) => void>(),
    terminate: vi.fn<() => void>(),
  };
}

function createWorkerFactory(worker: FakeWorker) {
  return vi.fn<() => Worker>(() => worker as unknown as Worker);
}

afterEach(() => {
  vi.useRealTimers();
});

// Worker lifecycle mechanics (id matching, stale responses, replacement on
// timeout, unmount cleanup) are covered by use-worker-deadline.test.ts. These
// tests cover only what useTextDiff contributes: the request shape, the
// trigger gating, and the timeout result mapping.
describe('useTextDiff', () => {
  test('posts a request with the original and modified text when trigger changes to 1', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender, result } = renderHook(
      (props: { modified: string; original: string; trigger: number }) =>
        useTextDiff(
          props.original,
          props.modified,
          props.trigger,
          workerFactory
        ),
      { initialProps: { modified: '', original: '', trigger: 0 } }
    );

    rerender({ modified: 'b', original: 'a', trigger: 1 });

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    expect(worker.postMessage.mock.calls[0][0]).toMatchObject({
      modified: 'b',
      original: 'a',
    });
    expect(result.current.computing).toBe(true);
  });

  test('reports the timeout result after the execution deadline', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useTextDiff('a', 'b', 1, workerFactory)
    );

    act(() => {
      vi.advanceTimersByTime(TEXT_DIFF_EXECUTION_DEADLINE_MS);
    });

    expect(result.current.result).toMatchObject({
      error: TEXT_DIFF_TIMEOUT_ERROR,
      timedOut: true,
    });
    expect(result.current.computing).toBe(false);
  });

  test('starts with null result and does not post on mount (trigger 0)', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useTextDiff('a', 'b', 0, workerFactory)
    );

    expect(result.current.result).toBeNull();
    expect(result.current.computing).toBe(false);
    expect(worker.postMessage).not.toHaveBeenCalled();
  });
});
