import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';
import type { Mock } from 'vitest';

import type {
  CsvConverterResult,
  CsvMode,
} from '@/lib/tools/csv-converter/adapters/csv-converter';

import type {
  CsvConverterRequest,
  CsvConverterResponse,
} from '../-worker/csv-converter.worker';
import {
  CSV_CONVERTER_EXECUTION_DEADLINE_MS,
  CSV_CONVERTER_TIMEOUT_ERROR,
  useCsvConverter,
} from './use-csv-converter';

interface FakeWorker {
  onmessage: ((event: MessageEvent<CsvConverterResponse>) => void) | null;
  postMessage: Mock<(request: CsvConverterRequest) => void>;
  terminate: Mock<() => void>;
}

const VALID_RESULT: CsvConverterResult = {
  isValid: true,
  output: '',
};

function createFakeWorker(): FakeWorker {
  return {
    onmessage: null,
    postMessage: vi.fn<(request: CsvConverterRequest) => void>(),
    terminate: vi.fn<() => void>(),
  };
}

function createWorkerFactory(worker: FakeWorker) {
  return vi.fn<() => Worker>(() => worker as unknown as Worker);
}

function respond(worker: FakeWorker, response: CsvConverterResponse) {
  act(() => {
    (worker.onmessage as (event: { data: CsvConverterResponse }) => void)({
      data: response,
    });
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useCsvConverter', () => {
  test('posts a message with an id when trigger changes to 1', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender, result } = renderHook(
      (props: { input: string; mode: CsvMode; trigger: number }) =>
        useCsvConverter(props.input, props.mode, props.trigger, workerFactory),
      { initialProps: { input: '', mode: 'csv-to-json', trigger: 0 } }
    );

    rerender({ input: 'name,age', mode: 'csv-to-json', trigger: 1 });

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    const request = worker.postMessage.mock.calls[0][0];
    expect(request.id).toBeDefined();
    expect(typeof request.id).toBe('string');
    expect(request).toMatchObject({ input: 'name,age', mode: 'csv-to-json' });
    expect(result.current.computing).toBe(true);
  });

  test('sets result from a worker response matching the latest id', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useCsvConverter('name,age', 'csv-to-json', 1, workerFactory)
    );

    const request = worker.postMessage.mock.calls[0][0];
    const converterResult: CsvConverterResult = {
      isValid: true,
      output: '[\n  {\n    "name": "Alice"\n  }\n]',
    };
    respond(worker, { id: request.id, result: converterResult });

    expect(result.current.result).toEqual(converterResult);
    expect(result.current.computing).toBe(false);
  });

  test('ignores stale responses (older id arrives after newer request)', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender, result } = renderHook(
      (props: { input: string; mode: CsvMode; trigger: number }) =>
        useCsvConverter(props.input, props.mode, props.trigger, workerFactory),
      { initialProps: { input: '', mode: 'csv-to-json', trigger: 0 } }
    );

    rerender({ input: 'a', mode: 'csv-to-json', trigger: 1 });
    const firstRequest = worker.postMessage.mock.calls[0][0];

    rerender({ input: 'b', mode: 'csv-to-json', trigger: 2 });
    const secondRequest = worker.postMessage.mock.calls[1][0];

    respond(worker, { id: firstRequest.id, result: VALID_RESULT });
    expect(result.current.result).toBeNull();

    respond(worker, {
      id: secondRequest.id,
      result: { ...VALID_RESULT, output: 'out' },
    });
    expect(result.current.result?.output).toBe('out');
  });

  test('on deadline timeout terminates the worker, creates a replacement, and reports timedOut', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useCsvConverter('name,age', 'csv-to-json', 1, workerFactory)
    );

    expect(worker.postMessage).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(CSV_CONVERTER_EXECUTION_DEADLINE_MS);
    });

    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(workerFactory).toHaveBeenCalledTimes(2);
    expect(result.current.result?.timedOut).toBe(true);
    expect(result.current.result?.error).toBe(CSV_CONVERTER_TIMEOUT_ERROR);
    expect(result.current.computing).toBe(false);
  });

  test('cleans up and terminates the worker on unmount', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { unmount } = renderHook(() =>
      useCsvConverter('name,age', 'csv-to-json', 1, workerFactory)
    );

    unmount();

    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  test('starts with null result and no synchronous postMessage on mount (trigger 0)', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useCsvConverter('name,age', 'csv-to-json', 0, workerFactory)
    );

    expect(result.current.result).toBeNull();
    expect(result.current.computing).toBe(false);
    expect(worker.postMessage).not.toHaveBeenCalled();
  });
});
