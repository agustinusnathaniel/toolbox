import { act, renderHook } from '@testing-library/react';
import type { Mock } from 'vite-plus/test';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import { WORKER_DEADLINE_MS } from '@/lib/hooks/use-worker-deadline';
import type { XmlIndent } from '@/lib/tools/xml-formatter/adapters/xml-formatter';
import type { XmlAction } from '@/lib/tools/xml-formatter/adapters/xml-params';

import type {
  XmlFormatterRequest,
  XmlFormatterResponse,
} from '../-worker/xml-formatter.worker';
import {
  useXmlFormatter,
  XML_FORMATTER_TIMEOUT_ERROR,
} from './use-xml-formatter';

interface FakeWorker {
  onmessage: ((event: MessageEvent<XmlFormatterResponse>) => void) | null;
  postMessage: Mock<(request: XmlFormatterRequest) => void>;
  terminate: Mock<() => void>;
}

function createFakeWorker(): FakeWorker {
  return {
    onmessage: null,
    postMessage: vi.fn<(request: XmlFormatterRequest) => void>(),
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
// tests cover the trigger-driven posting and timeout result behavior
// contributed by useXmlFormatter.
describe('useXmlFormatter request posting', () => {
  test('posts a request with the input, indent, and action when trigger changes to 1', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender, result } = renderHook(
      (props: { input: string; trigger: number }) =>
        useXmlFormatter(
          props.input,
          '2',
          'format',
          props.trigger,
          workerFactory
        ),
      { initialProps: { input: '', trigger: 0 } }
    );

    rerender({ input: '<root><item>1</item></root>', trigger: 1 });

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    expect(worker.postMessage.mock.calls[0][0]).toMatchObject({
      action: 'format',
      indent: '2',
      input: '<root><item>1</item></root>',
    });
    expect(result.current.computing).toBe(true);
  });
});

describe('useXmlFormatter explicit-run semantics', () => {
  test('does not repost when the input changes without a new trigger', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender } = renderHook(
      (props: { input: string; trigger: number }) =>
        useXmlFormatter(
          props.input,
          '2',
          'format',
          props.trigger,
          workerFactory
        ),
      { initialProps: { input: '<a/>', trigger: 1 } }
    );

    expect(worker.postMessage).toHaveBeenCalledTimes(1);

    // Explicit-run semantics: edits alone never recompute.
    rerender({ input: '<b/>', trigger: 1 });

    expect(worker.postMessage).toHaveBeenCalledTimes(1);
  });
});

describe('useXmlFormatter repost on new trigger', () => {
  test('reposts with the latest params when the trigger bumps again', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { rerender } = renderHook(
      (props: { action: XmlAction; indent: XmlIndent; trigger: number }) =>
        useXmlFormatter(
          '<root/>',
          props.indent,
          props.action,
          props.trigger,
          workerFactory
        ),
      {
        initialProps: {
          action: 'format' as XmlAction,
          indent: '2' as XmlIndent,
          trigger: 1,
        },
      }
    );

    expect(worker.postMessage).toHaveBeenCalledTimes(1);

    rerender({ action: 'minify', indent: 'tab', trigger: 2 });

    expect(worker.postMessage).toHaveBeenCalledTimes(2);
    expect(worker.postMessage.mock.calls[1][0]).toMatchObject({
      action: 'minify',
      indent: 'tab',
    });
  });
});

describe('useXmlFormatter result handling', () => {
  test('delivers the worker result and clears the computing flag', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useXmlFormatter('<root/>', '2', 'format', 1, workerFactory)
    );

    const requestId = (
      worker.postMessage.mock.calls[0][0] as XmlFormatterRequest
    ).id;
    act(() => {
      worker.onmessage?.({
        data: {
          id: requestId,
          result: { isValid: true, output: '<root/>' },
        },
      } as MessageEvent<XmlFormatterResponse>);
    });

    expect(result.current.result).toMatchObject({
      isValid: true,
      output: '<root/>',
    });
    expect(result.current.computing).toBe(false);
  });

  test('reports the timeout result after the execution deadline', () => {
    vi.useFakeTimers();
    const worker = createFakeWorker();
    const workerFactory = createWorkerFactory(worker);
    const { result } = renderHook(() =>
      useXmlFormatter('<root/>', '2', 'format', 1, workerFactory)
    );

    act(() => {
      vi.advanceTimersByTime(WORKER_DEADLINE_MS);
    });

    expect(result.current.result).toMatchObject({
      error: XML_FORMATTER_TIMEOUT_ERROR,
      timedOut: true,
    });
    expect(result.current.computing).toBe(false);
  });
});
