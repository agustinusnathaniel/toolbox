import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';
import type { Mock } from 'vitest';

import type { SqlFormatterResult } from '@/lib/tools/sql-formatter/adapters/sql-formatter';

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

const VALID_RESULT: SqlFormatterResult = {
  formatted: 'SELECT *\nFROM foo',
  isValid: true,
};

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

function respond(worker: FakeWorker, response: SqlFormatterResponse) {
  act(() => {
    (worker.onmessage as (event: { data: SqlFormatterResponse }) => void)({
      data: response,
    });
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useSqlFormatter', () => {
  test('posts a message with an id when trigger changes to 1', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender, result } = renderHook(
      (props: {
        action: 'format' | 'minify';
        dialect: 'sql';
        input: string;
        trigger: number;
      }) =>
        useSqlFormatter(
          props.input,
          props.dialect,
          props.action,
          props.trigger,
          workerFactory
        ),
      {
        initialProps: {
          action: 'format' as const,
          dialect: 'sql' as const,
          input: '',
          trigger: 0,
        },
      }
    );

    rerender({
      action: 'format',
      dialect: 'sql',
      input: 'select * from foo',
      trigger: 1,
    });

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    const request = worker.postMessage.mock.calls[0][0];
    expect(request.id).toBeDefined();
    expect(typeof request.id).toBe('string');
    expect(request).toMatchObject({
      action: 'format',
      dialect: 'sql',
      input: 'select * from foo',
    });
    expect(result.current.computing).toBe(true);
  });

  test('sets result from a worker response matching the latest id', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useSqlFormatter('select * from foo', 'sql', 'format', 1, workerFactory)
    );

    const request = worker.postMessage.mock.calls[0][0];
    respond(worker, { id: request.id, result: VALID_RESULT });

    expect(result.current.result).toEqual(VALID_RESULT);
    expect(result.current.computing).toBe(false);
  });

  test('on deadline timeout terminates the worker, creates a replacement, and reports timedOut', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useSqlFormatter('select * from foo', 'sql', 'format', 1, workerFactory)
    );

    expect(worker.postMessage).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(SQL_FORMATTER_EXECUTION_DEADLINE_MS);
    });

    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(workerFactory).toHaveBeenCalledTimes(2);
    expect(result.current.result?.timedOut).toBe(true);
    expect(result.current.result?.error).toBe(SQL_FORMATTER_TIMEOUT_ERROR);
    expect(result.current.computing).toBe(false);
  });

  test('starts with null result and no synchronous postMessage on mount (trigger 0)', () => {
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
