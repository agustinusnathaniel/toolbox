import { useCallback } from 'react';

import type { UseJsPerfRunnerOptions } from './use-js-perf-runner';
import type { useRunnerInternals } from './use-runner-internals';

function useRunCallback(
  optionsRef: React.MutableRefObject<UseJsPerfRunnerOptions>,
  internals: ReturnType<typeof useRunnerInternals>,
  doStartRound: () => void
) {
  return useCallback(() => {
    const opts = optionsRef.current;
    const isReady = internals.workerAReady && internals.workerBReady;
    if (
      internals.runState !== 'idle' ||
      !internals.workerARef.current ||
      !internals.workerBRef.current ||
      !isReady
    ) {
      return;
    }
    internals.setResultA(null);
    internals.setResultB(null);
    internals.setRunState('running');
    internals.sessionRef.current = {
      codeA: opts.codeA,
      codeB: opts.codeB,
      deadlineMs: internals.deadlineRef.current,
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
    doStartRound();
  }, [
    internals.runState,
    doStartRound,
    internals.deadlineRef.current,
    internals.workerARef.current,
    internals.setResultA,
    internals.setRunState,
    internals.workerBReady,
    internals.sessionRef,
    optionsRef.current,
    internals.workerBRef.current,
    internals.setResultB,
    internals.workerAReady,
  ]);
}

function useTerminateCallback(
  internals: ReturnType<typeof useRunnerInternals>,
  setupWorkers: () => void
) {
  return useCallback(() => {
    internals.workerAIdRef.current += 1;
    internals.workerBIdRef.current += 1;
    internals.workerARef.current?.terminate();
    internals.workerBRef.current?.terminate();
    internals.workerARef.current = null;
    internals.workerBRef.current = null;
    internals.pendingRef.current.clear();
    internals.activeRunRef.current = { a: null, b: null };
    internals.sessionRef.current = null;
    internals.setStabilityProgress(null);
    internals.setRunState('idle');
    internals.setResultA(null);
    internals.setResultB(null);
    internals.setWorkerAReady(false);
    internals.setWorkerBReady(false);
    setupWorkers();
  }, [
    setupWorkers,
    internals.workerARef.current?.terminate,
    internals.setWorkerBReady,
    internals.setResultB,
    internals.setResultA,
    internals.activeRunRef,
    internals.workerBRef.current?.terminate,
    internals.workerARef,
    internals.workerBIdRef,
    internals.pendingRef.current.clear,
    internals.workerBRef,
    internals.setRunState,
    internals.workerAIdRef,
    internals.setWorkerAReady,
    internals.setStabilityProgress,
    internals.sessionRef,
  ]);
}

function useResetCallback(internals: ReturnType<typeof useRunnerInternals>) {
  return useCallback(() => {
    internals.pendingRef.current.clear();
    internals.activeRunRef.current = { a: null, b: null };
    internals.sessionRef.current = null;
    internals.setStabilityProgress(null);
    internals.setRunState('idle');
    internals.setResultA(null);
    internals.setResultB(null);
  }, [
    internals.setResultA,
    internals.setRunState,
    internals.sessionRef,
    internals.setStabilityProgress,
    internals.setResultB,
    internals.pendingRef.current.clear,
    internals.activeRunRef,
  ]);
}

export function useRunnerActions(
  optionsRef: React.MutableRefObject<UseJsPerfRunnerOptions>,
  internals: ReturnType<typeof useRunnerInternals>,
  doStartRound: () => void,
  setupWorkers: () => void
) {
  const run = useRunCallback(optionsRef, internals, doStartRound);
  const terminate = useTerminateCallback(internals, setupWorkers);
  const reset = useResetCallback(internals);
  return { reset, run, terminate };
}
