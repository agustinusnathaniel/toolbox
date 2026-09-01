import { act, renderHook } from '@testing-library/react';
import type { Mock } from 'vite-plus/test';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

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

afterEach(() => {
  vi.useRealTimers();
});

// Worker lifecycle mechanics (id matching, stale responses, replacement on
// timeout, unmount cleanup) are covered by use-worker-deadline.test.ts. These
// tests cover only what useRegexTester contributes: the debounce, the request
// shape, the timeout result mapping, and the empty-result default.
describe('useRegexTester', () => {
  test('posts a debounced request after the debounce window when inputs change', () => {
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
    expect(worker.postMessage.mock.calls[0][0]).toMatchObject({
      flags: '',
      input: 'b',
      pattern: 'a+',
    });
  });

  test('reports the timeout result after the execution deadline', () => {
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

    expect(result.current.result.timedOut).toBe(true);
    expect(result.current.result.error).toBeDefined();
  });

  test('starts with an empty valid result and no synchronous testRegex call', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useRegexTester('(a+)+$', '', 'aaaaaaaaaaaaaaaaaaaaaaaa!', workerFactory)
    );

    expect(result.current.result).toEqual({
      isValid: true,
      matchCount: 0,
      matches: [],
    });
    expect(worker.postMessage).not.toHaveBeenCalled();
  });
});
