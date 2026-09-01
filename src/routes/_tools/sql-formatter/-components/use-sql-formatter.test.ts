import { act, renderHook } from '@testing-library/react';
import type { Mock } from 'vite-plus/test';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import type {
  SqlFormatterRequest,
  SqlFormatterResponse,
} from '../-worker/sql-formatter.worker';
import {
  SQL_FORMATTER_EXECUTION_DEADLINE_MS,
  SQL_FORMATTER_TIMEOUT_ERROR,
  useSqlFormatter,
} from './use-sql-formatter';

interface FakeWorker {
  onmessage: ((event: MessageEvent<SqlFormatterResponse>) => void) | null;
  postMessage: Mock<(request: SqlFormatterRequest) => void>;
  terminate: Mock<() => void>;
}

function createFakeWorker(): FakeWorker {
  return {
    onmessage: null,
    postMessage: vi.fn<(request: SqlFormatterRequest) => void>(),
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
// tests cover only what useSqlFormatter contributes: the request shape, the
// trigger gating, the blank-input clearing, and the timeout result mapping.
describe('useSqlFormatter', () => {
  test('posts a request with the input, dialect, and action when trigger changes to 1', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender, result } = renderHook(
      (props: { input: string; trigger: number }) =>
        useSqlFormatter(
          props.input,
          'sql',
          'format',
          props.trigger,
          workerFactory
        ),
      { initialProps: { input: '', trigger: 0 } }
    );

    rerender({ input: 'select * from foo', trigger: 1 });

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    expect(worker.postMessage.mock.calls[0][0]).toMatchObject({
      action: 'format',
      dialect: 'sql',
      input: 'select * from foo',
    });
    expect(result.current.computing).toBe(true);
  });

  test('clears the result when the input is blank', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender, result } = renderHook(
      (props: { input: string }) =>
        useSqlFormatter(props.input, 'sql', 'format', 1, workerFactory),
      { initialProps: { input: 'select * from foo' } }
    );

    expect(worker.postMessage).toHaveBeenCalledTimes(1);

    rerender({ input: '   ' });

    expect(result.current.result).toBeNull();
    expect(worker.postMessage).toHaveBeenCalledTimes(1);
  });

  test('reports the timeout result after the execution deadline', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useSqlFormatter('select * from foo', 'sql', 'format', 1, workerFactory)
    );

    act(() => {
      vi.advanceTimersByTime(SQL_FORMATTER_EXECUTION_DEADLINE_MS);
    });

    expect(result.current.result).toMatchObject({
      error: SQL_FORMATTER_TIMEOUT_ERROR,
      timedOut: true,
    });
    expect(result.current.computing).toBe(false);
  });

  test('starts with null result and does not post on mount (trigger 0)', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useSqlFormatter('select * from foo', 'sql', 'format', 0, workerFactory)
    );

    expect(result.current.result).toBeNull();
    expect(result.current.computing).toBe(false);
    expect(worker.postMessage).not.toHaveBeenCalled();
  });
});
