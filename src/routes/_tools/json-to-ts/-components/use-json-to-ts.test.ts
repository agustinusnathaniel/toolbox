import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';
import type { Mock } from 'vitest';

import type { JsonToTsResult } from '@/lib/tools/json-to-ts/adapters/json-to-ts';

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

const VALID_RESULT: JsonToTsResult = {
  isValid: true,
  output: 'export interface Root {\n}\n',
};

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

function respond(worker: FakeWorker, response: JsonToTsResponse) {
  act(() => {
    (worker.onmessage as (event: { data: JsonToTsResponse }) => void)({
      data: response,
    });
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useJsonToTs', () => {
  test('posts a message with an id and the input when trigger changes to 1', () => {
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
    const request = worker.postMessage.mock.calls[0][0];
    expect(request.id).toBeDefined();
    expect(typeof request.id).toBe('string');
    expect(request).toMatchObject({ input: '{"a":1}' });
    expect(result.current.computing).toBe(true);
  });

  test('sets result from a worker response matching the latest id', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useJsonToTs('{"a":1}', 1, workerFactory)
    );

    const request = worker.postMessage.mock.calls[0][0];
    respond(worker, { id: request.id, result: VALID_RESULT });

    expect(result.current.result).toEqual(VALID_RESULT);
    expect(result.current.computing).toBe(false);
  });

  test('ignores stale responses (older id arrives after newer request)', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender, result } = renderHook(
      (props: { input: string; trigger: number }) =>
        useJsonToTs(props.input, props.trigger, workerFactory),
      { initialProps: { input: '', trigger: 0 } }
    );

    rerender({ input: '{"a":1}', trigger: 1 });
    const firstRequest = worker.postMessage.mock.calls[0][0];

    rerender({ input: '{"b":2}', trigger: 2 });
    const secondRequest = worker.postMessage.mock.calls[1][0];

    respond(worker, { id: firstRequest.id, result: VALID_RESULT });
    expect(result.current.result).toBeNull();

    respond(worker, {
      id: secondRequest.id,
      result: { isValid: true, output: 'export interface B2 {\n}\n' },
    });
    expect(result.current.result?.output).toBe('export interface B2 {\n}\n');
  });

  test('on deadline timeout terminates the worker, creates a replacement, and reports timedOut', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useJsonToTs('{"a":1}', 1, workerFactory)
    );

    expect(worker.postMessage).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(JSON_TO_TS_EXECUTION_DEADLINE_MS);
    });

    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(workerFactory).toHaveBeenCalledTimes(2);
    expect(result.current.result?.timedOut).toBe(true);
    expect(result.current.result?.error).toBe(JSON_TO_TS_TIMEOUT_ERROR);
    expect(result.current.computing).toBe(false);
  });

  test('cleans up and terminates the worker on unmount', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { unmount } = renderHook(() =>
      useJsonToTs('{"a":1}', 1, workerFactory)
    );

    unmount();

    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  test('starts with null result and no synchronous postMessage on mount (trigger 0)', () => {
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
