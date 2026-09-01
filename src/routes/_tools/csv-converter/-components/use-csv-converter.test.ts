import { act, renderHook } from '@testing-library/react';
import type { Mock } from 'vite-plus/test';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import type { CsvMode } from '@/lib/tools/csv-converter/adapters/csv-converter';

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

afterEach(() => {
  vi.useRealTimers();
});

// Worker lifecycle mechanics (id matching, stale responses, replacement on
// timeout, unmount cleanup) are covered by use-worker-deadline.test.ts. These
// tests cover only what useCsvConverter contributes: the request shape, the
// trigger gating, and the timeout result mapping.
describe('useCsvConverter', () => {
  test('posts a request with the input and mode when trigger changes to 1', () => {
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
    expect(worker.postMessage.mock.calls[0][0]).toMatchObject({
      input: 'name,age',
      mode: 'csv-to-json',
    });
    expect(result.current.computing).toBe(true);
  });

  test('reports the timeout result after the execution deadline', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useCsvConverter('name,age', 'csv-to-json', 1, workerFactory)
    );

    act(() => {
      vi.advanceTimersByTime(CSV_CONVERTER_EXECUTION_DEADLINE_MS);
    });

    expect(result.current.result).toMatchObject({
      error: CSV_CONVERTER_TIMEOUT_ERROR,
      timedOut: true,
    });
    expect(result.current.computing).toBe(false);
  });

  test('starts with null result and does not post on mount (trigger 0)', () => {
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
