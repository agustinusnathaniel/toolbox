'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface WorkerDeadlineOptions<TRequest, TResponse, TResult> {
  /** If true, the hook fires automatically on mount (for auto-fire tools like regex-tester). If false (default), requires a trigger value > 0 */
  autoFire?: boolean;
  /** Build a request object with the given ID from the provided params */
  buildRequest: (id: string) => TRequest;
  /** Duration in ms before the worker is considered hung */
  deadlineMs?: number;
  /** Extract the request ID from a worker response */
  extractId: (response: TResponse) => string;
  /** Extract the result from a worker response */
  extractResult: (response: TResponse) => TResult;
  /** Result to set when the deadline expires */
  timeoutResult: TResult;
  /** Factory that creates a new Worker instance */
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

const DEFAULT_DEADLINE_MS = 2000;

export function useWorkerDeadline<TRequest, TResponse, TResult>(
  options: WorkerDeadlineOptions<TRequest, TResponse, TResult>
): UseWorkerDeadlineReturn<TResult> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const { autoFire = false } = options;

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

  const handleTimeout = useCallback(() => {
    workerRef.current?.terminate();
    latestIdRef.current = null;
    const replacement = optionsRef.current.workerFactory();
    attachWorker(replacement);
    setResult(optionsRef.current.timeoutResult);
    setComputing(false);
  }, [attachWorker]);

  useEffect(() => {
    const worker = optionsRef.current.workerFactory();
    attachWorker(worker);

    return () => {
      clearDeadline();
      workerRef.current?.terminate();
      workerRef.current = null;
      latestIdRef.current = null;
    };
  }, [attachWorker, clearDeadline]);

  const postRequest = useCallback(() => {
    clearDeadline();
    const id = crypto.randomUUID();
    latestIdRef.current = id;
    workerRef.current?.postMessage(optionsRef.current.buildRequest(id));
    setComputing(true);
    deadlineRef.current = setTimeout(
      handleTimeout,
      optionsRef.current.deadlineMs ?? DEFAULT_DEADLINE_MS
    );
  }, [clearDeadline, handleTimeout]);

  useEffect(() => {
    if (autoFire) {
      postRequest();
    }
  }, [autoFire, postRequest]);

  return { computing, postRequest, result, setResult };
}
