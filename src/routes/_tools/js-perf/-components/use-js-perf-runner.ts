import { useCallback, useEffect, useRef, useState } from 'react';

import {
  buildStabilitySummaryResult,
  createWorkerErrorResult,
  DEFAULT_RUN_POLICY,
  type ExecutionResult,
} from '@/lib/js-perf-comp-core/models';
import {
  createExecutionRequest,
  type WorkerInboundMessage,
} from '@/lib/js-perf-comp-core/worker-api';

import { buildWorker } from './runner-utils';
import type { ActiveRunState, RunState, StabilitySession } from './types';

export interface UseJsPerfRunnerOptions {
  codeA: string;
  codeB: string;
  iterations: number;
  setupA: string;
  setupB: string;
  stabilityMode: boolean;
  stabilityRounds: number;
  teardownA: string;
  teardownB: string;
}

export interface UseJsPerfRunnerReturn {
  isReady: boolean;
  reset: () => void;
  resultA: ExecutionResult | null;
  resultB: ExecutionResult | null;
  run: () => void;
  runState: RunState;
  stabilityProgress: {
    current: number;
    total: number;
  } | null;
  terminate: () => void;
}

export function useJsPerfRunner(
  options: UseJsPerfRunnerOptions
): UseJsPerfRunnerReturn {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [runState, setRunState] = useState<RunState>('idle');
  const [resultA, setResultA] = useState<ExecutionResult | null>(null);
  const [resultB, setResultB] = useState<ExecutionResult | null>(null);
  const [workerAReady, setWorkerAReady] = useState(false);
  const [workerBReady, setWorkerBReady] = useState(false);
  const [stabilityProgress, setStabilityProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const workerARef = useRef<Worker | null>(null);
  const workerBRef = useRef<Worker | null>(null);
  const workerAIdRef = useRef(0);
  const workerBIdRef = useRef(0);
  const deadlineRef = useRef<number>(DEFAULT_RUN_POLICY.deadlineMs);
  const pendingRef = useRef<Set<string>>(new Set());
  const activeRunRef = useRef<ActiveRunState>({ a: null, b: null });
  const sessionRef = useRef<StabilitySession | null>(null);

  const isReady = workerAReady && workerBReady;

  const finalizeSession = useCallback(() => {
    const session = sessionRef.current;
    if (!session) {
      setRunState('done');
      setStabilityProgress(null);
      return;
    }

    if (session.mode === 'single') {
      setRunState('done');
      setStabilityProgress(null);
      sessionRef.current = null;
      return;
    }

    const summaryA = buildStabilitySummaryResult(
      session.codeA,
      session.iterations,
      session.roundsTotal,
      session.resultsA,
      'A'
    );
    const summaryB = buildStabilitySummaryResult(
      session.codeB,
      session.iterations,
      session.roundsTotal,
      session.resultsB,
      'B'
    );

    setResultA(summaryA);
    setResultB(summaryB);
    setRunState('done');
    setStabilityProgress(null);
    sessionRef.current = null;
  }, []);

  const startSessionRound = useCallback(() => {
    const session = sessionRef.current;
    if (!session) {
      return;
    }

    if (!(workerARef.current && workerBRef.current)) {
      return;
    }

    const nextRound = session.roundsCompleted + 1;
    session.roundsCompleted = nextRound;

    if (session.mode === 'stability') {
      setStabilityProgress({
        current: nextRound,
        total: session.roundsTotal,
      });
    } else {
      setStabilityProgress(null);
    }

    const reqA = createExecutionRequest(
      session.codeA,
      session.deadlineMs,
      session.iterations,
      session.setupA,
      session.teardownA
    );
    reqA.id = `a-r${nextRound}-${reqA.id}`;

    const reqB = createExecutionRequest(
      session.codeB,
      session.deadlineMs,
      session.iterations,
      session.setupB,
      session.teardownB
    );
    reqB.id = `b-r${nextRound}-${reqB.id}`;

    activeRunRef.current = {
      a: { code: reqA.code, id: reqA.id },
      b: { code: reqB.code, id: reqB.id },
    };
    pendingRef.current = new Set([reqA.id, reqB.id]);

    const msgA: WorkerInboundMessage = { payload: reqA, type: 'execute' };
    const msgB: WorkerInboundMessage = { payload: reqB, type: 'execute' };

    workerARef.current.postMessage(msgA);
    workerBRef.current.postMessage(msgB);
  }, []);

  const handleRoundFinished = useCallback(() => {
    const session = sessionRef.current;
    if (!session) {
      setRunState('done');
      setStabilityProgress(null);
      return;
    }

    if (
      session.mode === 'stability' &&
      session.roundsCompleted < session.roundsTotal
    ) {
      startSessionRound();
      return;
    }

    finalizeSession();
  }, [finalizeSession, startSessionRound]);

  const setupWorkers = useCallback(() => {
    const handleWorkerAReady = () => setWorkerAReady(true);
    const handleWorkerBReady = () => setWorkerBReady(true);

    const handleWorkerAResult = (id: string, result: ExecutionResult) => {
      if (!pendingRef.current.has(id)) {
        return;
      }
      pendingRef.current.delete(id);
      activeRunRef.current.a = null;
      const session = sessionRef.current;
      if (session?.mode === 'stability') {
        session.resultsA.push(result);
      } else {
        setResultA(result);
      }
      if (pendingRef.current.size === 0) {
        handleRoundFinished();
      }
    };

    const handleWorkerBResult = (id: string, result: ExecutionResult) => {
      if (!pendingRef.current.has(id)) {
        return;
      }
      pendingRef.current.delete(id);
      activeRunRef.current.b = null;
      const session = sessionRef.current;
      if (session?.mode === 'stability') {
        session.resultsB.push(result);
      } else {
        setResultB(result);
      }
      if (pendingRef.current.size === 0) {
        handleRoundFinished();
      }
    };

    const handleWorkerAError = (errorMessage: string | null) => {
      const runEntry = activeRunRef.current.a;
      if (runEntry && pendingRef.current.has(runEntry.id)) {
        pendingRef.current.delete(runEntry.id);
        const fallback = createWorkerErrorResult(runEntry, errorMessage);
        if (fallback) {
          const session = sessionRef.current;
          if (session?.mode === 'stability') {
            session.resultsA.push(fallback);
          } else {
            setResultA(fallback);
          }
        }
      }
      activeRunRef.current.a = null;
      if (pendingRef.current.size === 0) {
        handleRoundFinished();
      }
    };

    const handleWorkerBError = (errorMessage: string | null) => {
      const runEntry = activeRunRef.current.b;
      if (runEntry && pendingRef.current.has(runEntry.id)) {
        pendingRef.current.delete(runEntry.id);
        const fallback = createWorkerErrorResult(runEntry, errorMessage);
        if (fallback) {
          const session = sessionRef.current;
          if (session?.mode === 'stability') {
            session.resultsB.push(fallback);
          } else {
            setResultB(fallback);
          }
        }
      }
      activeRunRef.current.b = null;
      if (pendingRef.current.size === 0) {
        handleRoundFinished();
      }
    };

    buildWorker(
      workerARef,
      workerAIdRef,
      handleWorkerAReady,
      handleWorkerAResult,
      handleWorkerAError
    );

    buildWorker(
      workerBRef,
      workerBIdRef,
      handleWorkerBReady,
      handleWorkerBResult,
      handleWorkerBError
    );
  }, [handleRoundFinished]);

  useEffect(() => {
    setupWorkers();
    return () => {
      workerAIdRef.current += 1;
      workerBIdRef.current += 1;
      workerARef.current?.terminate();
      workerBRef.current?.terminate();
      workerARef.current = null;
      workerBRef.current = null;
      pendingRef.current.clear();
      activeRunRef.current = { a: null, b: null };
      sessionRef.current = null;
      setStabilityProgress(null);
      setWorkerAReady(false);
      setWorkerBReady(false);
    };
  }, [setupWorkers]);

  const run = useCallback(() => {
    const opts = optionsRef.current;
    if (
      runState !== 'idle' ||
      !workerARef.current ||
      !workerBRef.current ||
      !isReady
    ) {
      return;
    }

    setResultA(null);
    setResultB(null);
    setRunState('running');

    sessionRef.current = {
      codeA: opts.codeA,
      codeB: opts.codeB,
      deadlineMs: deadlineRef.current,
      iterations: opts.iterations,
      mode: opts.stabilityMode ? 'stability' : 'single',
      resultsA: [],
      resultsB: [],
      roundsCompleted: 0,
      roundsTotal: opts.stabilityRounds,
      setupA: opts.setupA,
      setupB: opts.setupB,
      teardownA: opts.teardownA,
      teardownB: opts.teardownB,
    };
    startSessionRound();
  }, [runState, isReady, startSessionRound]);

  const terminate = useCallback(() => {
    workerAIdRef.current += 1;
    workerBIdRef.current += 1;
    workerARef.current?.terminate();
    workerBRef.current?.terminate();
    workerARef.current = null;
    workerBRef.current = null;
    pendingRef.current.clear();
    activeRunRef.current = { a: null, b: null };
    sessionRef.current = null;
    setStabilityProgress(null);
    setRunState('idle');
    setResultA(null);
    setResultB(null);
    setWorkerAReady(false);
    setWorkerBReady(false);
    setupWorkers();
  }, [setupWorkers]);

  const reset = useCallback(() => {
    pendingRef.current.clear();
    activeRunRef.current = { a: null, b: null };
    sessionRef.current = null;
    setStabilityProgress(null);
    setRunState('idle');
    setResultA(null);
    setResultB(null);
  }, []);

  return {
    isReady,
    reset,
    resultA,
    resultB,
    run,
    runState,
    stabilityProgress,
    terminate,
  };
}
