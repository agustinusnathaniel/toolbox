import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';
import type { Mock } from 'vitest';

import type { RegexTestResult } from '@/lib/tools/regex-tester/adapters/regex';

import type {
  RegexTesterRequest,
  RegexTesterResponse,
} from '../-worker/regex-tester.worker';
import {
  REGEX_DEBOUNCE_MS,
  REGEX_EXECUTION_DEADLINE_MS,
  useRegexTester,
} from './use-regex-tester';

interface FakeWorker {
  onmessage: ((event: MessageEvent<RegexTesterResponse>) => void) | null;
  postMessage: Mock<(request: RegexTesterRequest) => void>;
  terminate: Mock<() => void>;
}

const EMPTY_RESULT: RegexTestResult = {
  isValid: true,
  matchCount: 0,
  matches: [],
};

function createFakeWorker(): FakeWorker {
  return {
    onmessage: null,
    postMessage: vi.fn<(request: RegexTesterRequest) => void>(),
    terminate: vi.fn<() => void>(),
  };
}

function createWorkerFactory(worker: FakeWorker) {
  return vi.fn<() => Worker>(() => worker as unknown as Worker);
}

function respond(worker: FakeWorker, response: RegexTesterResponse) {
  act(() => {
    (worker.onmessage as (event: { data: RegexTesterResponse }) => void)({
      data: response,
    });
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useRegexTester', () => {
  test('posts a debounced message with an id after 150ms when inputs change', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender } = renderHook(
      (props: { flags: string; input: string; pattern: string }) =>
        useRegexTester(props.pattern, props.flags, props.input, workerFactory),
      { initialProps: { flags: '', input: 'b', pattern: 'a' } }
    );

    rerender({ flags: '', input: 'b', pattern: 'a+' });

    expect(worker.postMessage).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(REGEX_DEBOUNCE_MS);
    });

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    const request = worker.postMessage.mock.calls[0][0];
    expect(request.id).toBeDefined();
    expect(typeof request.id).toBe('string');
    expect(request).toMatchObject({ flags: '', input: 'b', pattern: 'a+' });
  });

  test('sets result from a worker response matching the latest id', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useRegexTester('cat', '', 'the cat sat', workerFactory)
    );

    act(() => {
      vi.advanceTimersByTime(REGEX_DEBOUNCE_MS);
    });

    const request = worker.postMessage.mock.calls[0][0];
    const matchResult: RegexTestResult = {
      isValid: true,
      matchCount: 1,
      matches: [{ full: 'cat', groups: [], index: 4 }],
    };
    respond(worker, { id: request.id, result: matchResult });

    expect(result.current.result).toEqual(matchResult);
  });

  test('ignores stale responses (older id arrives after newer request)', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender, result } = renderHook(
      (props: { flags: string; input: string; pattern: string }) =>
        useRegexTester(props.pattern, props.flags, props.input, workerFactory),
      { initialProps: { flags: '', input: 'b', pattern: 'a' } }
    );

    act(() => {
      vi.advanceTimersByTime(REGEX_DEBOUNCE_MS);
    });
    const firstRequest = worker.postMessage.mock.calls[0][0];

    rerender({ flags: '', input: 'c', pattern: 'a' });
    act(() => {
      vi.advanceTimersByTime(REGEX_DEBOUNCE_MS);
    });
    const secondRequest = worker.postMessage.mock.calls[1][0];

    respond(worker, {
      id: firstRequest.id,
      result: { isValid: true, matchCount: 1, matches: [] },
    });
    expect(result.current.result).toEqual(EMPTY_RESULT);

    respond(worker, {
      id: secondRequest.id,
      result: {
        isValid: true,
        matchCount: 1,
        matches: [{ full: 'b', groups: [], index: 0 }],
      },
    });
    expect(result.current.result.matchCount).toBe(1);
  });

  test('on deadline timeout terminates the worker, creates a replacement, and reports timedOut', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useRegexTester('(a+)+$', '', 'aaaaaaaaaa', workerFactory)
    );

    act(() => {
      vi.advanceTimersByTime(REGEX_DEBOUNCE_MS);
    });
    expect(worker.postMessage).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(REGEX_EXECUTION_DEADLINE_MS);
    });

    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(workerFactory).toHaveBeenCalledTimes(2);
    expect(result.current.result.timedOut).toBe(true);
    expect(result.current.result.error).toBeDefined();
  });

  test('cleans up and terminates the worker on unmount', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { unmount } = renderHook(() =>
      useRegexTester('a', '', 'b', workerFactory)
    );

    unmount();

    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  test('starts with an empty valid result and no synchronous testRegex call', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useRegexTester('(a+)+$', '', 'aaaaaaaaaaaaaaaaaaaaaaaa!', workerFactory)
    );

    expect(result.current.result).toEqual(EMPTY_RESULT);
    expect(worker.postMessage).not.toHaveBeenCalled();
  });
});
