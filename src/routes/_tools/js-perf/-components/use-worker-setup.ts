import { useCallback, useEffect } from 'react';

import { buildWorker } from './runner-utils';
import {
  makeWorkerAErrorHandler,
  makeWorkerAResultHandler,
  makeWorkerBErrorHandler,
  makeWorkerBResultHandler,
} from './runner-worker-handlers';
import type { useRunnerInternals } from './use-runner-internals';

type SessionCbs = {
  doHandleRoundFinished: () => void;
};

export function useWorkerSetup(
  internals: ReturnType<typeof useRunnerInternals>,
  cbs: SessionCbs
) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: refs are stable, cbs is stable
  const setupWorkers = useCallback(() => {
    const deps = {
      activeRunRef: internals.activeRunRef,
      handleRoundFinished: cbs.doHandleRoundFinished,
      pendingRef: internals.pendingRef,
      sessionRef: internals.sessionRef,
      setResultA: internals.setResultA,
      setResultB: internals.setResultB,
    };
    buildWorker(
      internals.workerARef,
      internals.workerAIdRef,
      () => internals.setWorkerAReady(true),
      makeWorkerAResultHandler(deps),
      makeWorkerAErrorHandler(deps)
    );
    buildWorker(
      internals.workerBRef,
      internals.workerBIdRef,
      () => internals.setWorkerBReady(true),
      makeWorkerBResultHandler(deps),
      makeWorkerBErrorHandler(deps)
    );
  }, [cbs.doHandleRoundFinished]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setupWorkers stable, cleanup uses refs
  useEffect(() => {
    setupWorkers();
    return () => {
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
      internals.setWorkerAReady(false);
      internals.setWorkerBReady(false);
    };
  }, [setupWorkers]);

  return setupWorkers;
}
