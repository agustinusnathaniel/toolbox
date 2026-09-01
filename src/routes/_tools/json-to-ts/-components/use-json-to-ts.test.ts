import { act, renderHook } from '@testing-library/react';
import type { Mock } from 'vite-plus/test';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import type {
  JsonToTsRequest,
  JsonToTsResponse,
} from '../-worker/json-to-ts.worker';
import {
  JSON_TO_TS_EXECUTION_DEADLINE_MS,
  JSON_TO_TS_TIMEOUT_ERROR,
  useJsonToTs,
} from './use-json-to-ts';

interface FakeWorker {
  onmessage: ((event: MessageEvent<JsonToTsResponse>) => void) | null;
  postMessage: Mock<(request: JsonToTsRequest) => void>;
  terminate: Mock<() => void>;
}

function createFakeWorker(): FakeWorker {
  return {
    onmessage: null,
    postMessage: vi.fn<(request: JsonToTsRequest) => void>(),
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
// tests cover only what useJsonToTs contributes: the request shape, the
// trigger gating, and the timeout result mapping.
describe('useJsonToTs', () => {
  test('posts a request with the input when trigger changes to 1', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender, result } = renderHook(
      (props: { input: string; trigger: number }) =>
        useJsonToTs(props.input, props.trigger, workerFactory),
      { initialProps: { input: '', trigger: 0 } }
    );

    rerender({ input: '{"a":1}', trigger: 1 });

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    expect(worker.postMessage.mock.calls[0][0]).toMatchObject({
      input: '{"a":1}',
    });
    expect(result.current.computing).toBe(true);
  });

  test('reports the timeout result after the execution deadline', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useJsonToTs('{"a":1}', 1, workerFactory)
    );

    act(() => {
      vi.advanceTimersByTime(JSON_TO_TS_EXECUTION_DEADLINE_MS);
    });

    expect(result.current.result).toMatchObject({
      error: JSON_TO_TS_TIMEOUT_ERROR,
      timedOut: true,
    });
    expect(result.current.computing).toBe(false);
  });

  test('starts with null result and does not post on mount (trigger 0)', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useJsonToTs('{"a":1}', 0, workerFactory)
    );

    expect(result.current.result).toBeNull();
    expect(result.current.computing).toBe(false);
    expect(worker.postMessage).not.toHaveBeenCalled();
  });
});
