'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/** Fixed execution deadline shared by every worker-backed tool. */
export const WORKER_DEADLINE_MS = 2000;

export interface WorkerDeadlineOptions<TRequest, TResponse, TResult> {
  /** Build a request object with the given ID from the provided params */
  buildRequest: (id: string) => TRequest;
  /** Extract the request ID from a worker response */
  extractId: (response: TResponse) => string;
  /** Extract the result from a worker response */
  extractResult: (response: TResponse) => TResult;
  /** Result to set when the deadline expires */
  timeoutResult: TResult;
  /** Factory that creates a new Worker instance. Overridable in tests. */
  workerFactory: () => Worker;
}

export interface UseWorkerDeadlineReturn<TResult> {
  /** Whether the worker is currently processing */
  computing: boolean;
  /** Post a request to the worker. Call this from your trigger handler. */
  postRequest: () => void;
  /** The latest result from the worker (null if no result yet) */
  result: TResult | null;
  /** Manually set the result (for tools that need to clear it) */
  setResult: Dispatch<SetStateAction<TResult | null>>;
}

export function useWorkerDeadline<TRequest, TResponse, TResult>(
  options: WorkerDeadlineOptions<TRequest, TResponse, TResult>
): UseWorkerDeadlineReturn<TResult> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const workerRef = useRef<Worker | null>(null);
  const latestIdRef = useRef<string | null>(null);
  const deadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [result, setResult] = useState<TResult | null>(null);
  const [computing, setComputing] = useState(false);

  const clearDeadline = useCallback(() => {
    if (deadlineRef.current !== null) {
      clearTimeout(deadlineRef.current);
      deadlineRef.current = null;
    }
  }, []);

  const attachWorker = useCallback(
    (worker: Worker) => {
      worker.onmessage = (event: MessageEvent<TResponse>) => {
        // Ignore responses that no longer match the latest request.
        if (optionsRef.current.extractId(event.data) !== latestIdRef.current) {
          return;
        }
        clearDeadline();
        setResult(optionsRef.current.extractResult(event.data));
        setComputing(false);
      };
      workerRef.current = worker;
    },
    [clearDeadline]
  );

  useEffect(() => {
    attachWorker(optionsRef.current.workerFactory());
    return () => {
      clearDeadline();
      workerRef.current?.terminate();
      workerRef.current = null;
      latestIdRef.current = null;
    };
  }, [attachWorker, clearDeadline]);

  // The hung worker is terminated and replaced so the hook can keep serving
  // requests after a deadline.
  const handleTimeout = useCallback(() => {
    workerRef.current?.terminate();
    latestIdRef.current = null;
    attachWorker(optionsRef.current.workerFactory());
    setResult(optionsRef.current.timeoutResult);
    setComputing(false);
  }, [attachWorker]);

  // Stable identity: caller effects depend on postRequest and must not re-fire
  // when the worker is replaced.
  const postRequest = useCallback(() => {
    clearDeadline();
    const id = crypto.randomUUID();
    latestIdRef.current = id;
    workerRef.current?.postMessage(optionsRef.current.buildRequest(id));
    setComputing(true);
    deadlineRef.current = setTimeout(handleTimeout, WORKER_DEADLINE_MS);
  }, [clearDeadline, handleTimeout]);

  return { computing, postRequest, result, setResult };
}

export function useWorkerTrigger(
  postRequest: () => void,
  trigger: number,
  skip = false,
  onSkip?: () => void
): void {
  const onSkipRef = useRef(onSkip);
  onSkipRef.current = onSkip;

  useEffect(() => {
    if (trigger <= 0) {
      return;
    }
    if (skip) {
      onSkipRef.current?.();
      return;
    }
    postRequest();
  }, [postRequest, skip, trigger]);
}
