import { act, renderHook } from '@testing-library/react';
import type { Mock } from 'vite-plus/test';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import { useWorkerDeadline } from './use-worker-deadline';

interface TestRequest {
  id: string;
  value: string;
}

interface TestResponse {
  id: string;
  result: number;
}

interface FakeWorker {
  onmessage: ((event: MessageEvent<TestResponse>) => void) | null;
  postMessage: Mock<(request: TestRequest) => void>;
  terminate: Mock<() => void>;
}

function createFakeWorker(): FakeWorker {
  return {
    onmessage: null,
    postMessage: vi.fn<(request: TestRequest) => void>(),
    terminate: vi.fn<() => void>(),
  };
}

function createWorkerFactory(worker: FakeWorker) {
  return vi.fn<() => Worker>(() => worker as unknown as Worker);
}

function respond(worker: FakeWorker, response: TestResponse) {
  act(() => {
    (worker.onmessage as (event: { data: TestResponse }) => void)({
      data: response,
    });
  });
}

const TIMEOUT_RESULT = -1;

function setup(worker: FakeWorker, autoFire = false) {
  const workerFactory = createWorkerFactory(worker);
  const hook = renderHook(() =>
    useWorkerDeadline<TestRequest, TestResponse, number>({
      autoFire,
      buildRequest: (id) => ({ id, value: 'test' }),
      deadlineMs: 2000,
      extractId: (response) => response.id,
      extractResult: (response) => response.result,
      timeoutResult: TIMEOUT_RESULT,
      workerFactory,
    })
  );
  return { result: hook.result, unmount: hook.unmount, workerFactory };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useWorkerDeadline', () => {
  test('posts a message with a UUID when postRequest is called', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const { result } = setup(worker);

    act(() => {
      result.current.postRequest();
    });

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    const request = worker.postMessage.mock.calls[0][0];
    expect(request.id).toBeDefined();
    expect(typeof request.id).toBe('string');
    expect(request).toMatchObject({ value: 'test' });
    expect(result.current.computing).toBe(true);
  });

  test('sets result from a worker response matching the latest id', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const { result } = setup(worker);

    act(() => {
      result.current.postRequest();
    });
    const request = worker.postMessage.mock.calls[0][0];

    respond(worker, { id: request.id, result: 42 });

    expect(result.current.result).toBe(42);
    expect(result.current.computing).toBe(false);
  });

  test('ignores stale responses (older id arrives after newer request)', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const { result } = setup(worker);

    act(() => {
      result.current.postRequest();
    });
    const firstId = worker.postMessage.mock.calls[0][0].id;

    act(() => {
      result.current.postRequest();
    });
    const secondId = worker.postMessage.mock.calls[1][0].id;

    respond(worker, { id: firstId, result: 1 });
    expect(result.current.result).toBeNull();

    respond(worker, { id: secondId, result: 2 });
    expect(result.current.result).toBe(2);
  });

  test('on deadline timeout terminates the worker, creates a replacement, and sets the timeout result', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const { result, workerFactory } = setup(worker);

    act(() => {
      result.current.postRequest();
    });
    expect(worker.postMessage).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(workerFactory).toHaveBeenCalledTimes(2);
    expect(result.current.result).toBe(TIMEOUT_RESULT);
    expect(result.current.computing).toBe(false);
  });

  test('cleans up and terminates the worker on unmount', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const { result, unmount } = setup(worker);

    act(() => {
      result.current.postRequest();
    });

    act(() => {
      unmount();
    });

    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  test('autoFire mode posts a request automatically on mount', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    setup(worker, true);

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    const request = worker.postMessage.mock.calls[0][0];
    expect(request.id).toBeDefined();
  });

  test('does not post automatically on mount when autoFire is false', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    setup(worker);

    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  test('does not repost on rerender when the factory creates fresh workers', () => {
    vi.useFakeTimers();
    const workers: Array<FakeWorker> = [];
    const { rerender } = renderHook(
      (props: { value: string }) =>
        useWorkerDeadline<TestRequest, TestResponse, number>({
          autoFire: true,
          buildRequest: (id) => ({ id, value: props.value }),
          deadlineMs: 2000,
          extractId: (response) => response.id,
          extractResult: (response) => response.result,
          timeoutResult: TIMEOUT_RESULT,
          workerFactory: () => {
            const worker = createFakeWorker();
            workers.push(worker);
            return worker as unknown as Worker;
          },
        }),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    rerender({ value: 'c' });

    const totalPosts = workers.reduce(
      (sum, worker) => sum + worker.postMessage.mock.calls.length,
      0
    );
    expect(totalPosts).toBe(1);
  });
});
