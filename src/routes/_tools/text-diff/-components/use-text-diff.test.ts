import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';
import type { Mock } from 'vitest';

import type { TextDiffResult } from '@/lib/tools/text-diff/adapters/text-diff';

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

const VALID_RESULT: TextDiffResult = {
  addedCount: 0,
  fileDiff: null,
  isValid: true,
  removedCount: 0,
};

function createFakeWorker(): FakeWorker {
  return {
    onmessage: null,
    postMessage: vi.fn(),
    terminate: vi.fn(),
  };
}

function createWorkerFactory(worker: FakeWorker) {
  return vi.fn<() => Worker>(() => worker as unknown as Worker);
}

function respond(worker: FakeWorker, response: TextDiffResponse) {
  act(() => {
    (worker.onmessage as (event: { data: TextDiffResponse }) => void)({
      data: response,
    });
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useTextDiff', () => {
  test('posts a message with an id when trigger changes to 1', () => {
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
    const request = worker.postMessage.mock.calls[0][0];
    expect(request.id).toBeDefined();
    expect(typeof request.id).toBe('string');
    expect(request).toMatchObject({ modified: 'b', original: 'a' });
    expect(result.current.computing).toBe(true);
  });

  test('sets result from a worker response matching the latest id', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useTextDiff('a', 'b', 1, workerFactory)
    );

    const request = worker.postMessage.mock.calls[0][0];
    const diffResult: TextDiffResult = {
      addedCount: 1,
      fileDiff: null,
      isValid: true,
      removedCount: 0,
    };
    respond(worker, { id: request.id, result: diffResult });

    expect(result.current.result).toEqual(diffResult);
    expect(result.current.computing).toBe(false);
  });

  test('ignores stale responses (older id arrives after newer request)', () => {
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

    rerender({ modified: '', original: '', trigger: 1 });
    const firstRequest = worker.postMessage.mock.calls[0][0];

    rerender({ modified: '', original: '', trigger: 2 });
    const secondRequest = worker.postMessage.mock.calls[1][0];

    respond(worker, { id: firstRequest.id, result: VALID_RESULT });
    expect(result.current.result).toBeNull();

    respond(worker, {
      id: secondRequest.id,
      result: { ...VALID_RESULT, addedCount: 1 },
    });
    expect(result.current.result?.addedCount).toBe(1);
  });

  test('on deadline timeout terminates the worker, creates a replacement, and reports timedOut', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useTextDiff('a', 'b', 1, workerFactory)
    );

    expect(worker.postMessage).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(TEXT_DIFF_EXECUTION_DEADLINE_MS);
    });

    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(workerFactory).toHaveBeenCalledTimes(2);
    expect(result.current.result?.timedOut).toBe(true);
    expect(result.current.result?.error).toBe(TEXT_DIFF_TIMEOUT_ERROR);
    expect(result.current.computing).toBe(false);
  });

  test('cleans up and terminates the worker on unmount', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { unmount } = renderHook(() =>
      useTextDiff('a', 'b', 1, workerFactory)
    );

    unmount();

    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  test('starts with null result and no synchronous postMessage on mount (trigger 0)', () => {
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
