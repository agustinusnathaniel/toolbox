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

function attachWorkerImpl<TResponse, TResult>(
  worker: Worker,
  workerRef: React.MutableRefObject<Worker | null>,
  latestIdRef: React.MutableRefObject<string | null>,
  optionsRef: React.MutableRefObject<
    WorkerDeadlineOptions<unknown, TResponse, TResult>
  >,
  clearDeadline: () => void,
  setResult: Dispatch<SetStateAction<TResult | null>>,
  setComputing: Dispatch<SetStateAction<boolean>>
) {
  worker.onmessage = (event: MessageEvent<TResponse>) => {
    if (optionsRef.current.extractId(event.data) !== latestIdRef.current) {
      return;
    }
    clearDeadline();
    setResult(optionsRef.current.extractResult(event.data));
    setComputing(false);
  };
  workerRef.current = worker;
}

function useDeadlineRefs<TResponse, TResult>(
  optionsRef: React.MutableRefObject<
    WorkerDeadlineOptions<unknown, TResponse, TResult>
  >
) {
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
    (w: Worker) =>
      attachWorkerImpl(
        w,
        workerRef,
        latestIdRef,
        optionsRef,
        clearDeadline,
        setResult,
        setComputing
      ),
    [clearDeadline, optionsRef]
  );
  return {
    attachWorker,
    clearDeadline,
    computing,
    deadlineRef,
    latestIdRef,
    result,
    setComputing,
    setResult,
    workerRef,
  };
}

function useDeadlineTimeout<TResponse, TResult>(
  workerRef: React.MutableRefObject<Worker | null>,
  latestIdRef: React.MutableRefObject<string | null>,
  optionsRef: React.MutableRefObject<
    WorkerDeadlineOptions<unknown, TResponse, TResult>
  >,
  attachWorker: (w: Worker) => void,
  setResult: Dispatch<SetStateAction<TResult | null>>,
  setComputing: Dispatch<SetStateAction<boolean>>
) {
  return useCallback(() => {
    workerRef.current?.terminate();
    latestIdRef.current = null;
    attachWorker(optionsRef.current.workerFactory());
    setResult(optionsRef.current.timeoutResult);
    setComputing(false);
  }, [
    attachWorker,
    latestIdRef,
    optionsRef.current.workerFactory,
    workerRef.current?.terminate,
    optionsRef.current.timeoutResult,
    setResult,
    setComputing,
  ]);
}

export function useWorkerDeadline<TRequest, TResponse, TResult>(
  options: WorkerDeadlineOptions<TRequest, TResponse, TResult>
): UseWorkerDeadlineReturn<TResult> {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const { autoFire = false } = options;
  const refs = useDeadlineRefs(optionsRef as never);
  const handleTimeout = useDeadlineTimeout(
    refs.workerRef,
    refs.latestIdRef,
    optionsRef as never,
    refs.attachWorker,
    refs.setResult,
    refs.setComputing
  );
  useEffect(() => {
    const worker = optionsRef.current.workerFactory();
    refs.attachWorker(worker);
    return () => {
      refs.clearDeadline();
      refs.workerRef.current?.terminate();
      refs.workerRef.current = null;
      refs.latestIdRef.current = null;
    };
  }, [refs.attachWorker, refs.clearDeadline, refs.workerRef, refs.latestIdRef]);
  const postRequest = useCallback(() => {
    refs.clearDeadline();
    const id = crypto.randomUUID();
    refs.latestIdRef.current = id;
    refs.workerRef.current?.postMessage(
      optionsRef.current.buildRequest(id) as never
    );
    refs.setComputing(true);
    refs.deadlineRef.current = setTimeout(
      handleTimeout,
      optionsRef.current.deadlineMs ?? DEFAULT_DEADLINE_MS
    );
  }, [
    handleTimeout,
    refs.workerRef.current?.postMessage,
    refs.deadlineRef,
    refs.setComputing,
    refs.latestIdRef,
    refs.clearDeadline,
  ]);
  useEffect(() => {
    if (autoFire) {
      postRequest();
    }
  }, [autoFire, postRequest]);
  return {
    computing: refs.computing,
    postRequest,
    result: refs.result as TResult | null,
    setResult: refs.setResult,
  };
}
