import { useCallback } from 'react';

import {
  finalizeSession,
  handleRoundFinished,
  startSessionRound,
} from './runner-session-helpers';
import type { useRunnerInternals } from './use-runner-internals';

export function useSessionCallbacks(
  internals: ReturnType<typeof useRunnerInternals>
) {
  const doFinalize = useCallback(() => {
    finalizeSession(internals.sessionRef, {
      setResultA: internals.setResultA,
      setResultB: internals.setResultB,
      setRunState: internals.setRunState,
      setStabilityProgress: internals.setStabilityProgress,
    });
  }, [
    internals.setResultA,
    internals.setStabilityProgress,
    internals.sessionRef,
    internals.setResultB,
    internals.setRunState,
  ]);

  const doStartRound = useCallback(() => {
    startSessionRound(
      {
        activeRunRef: internals.activeRunRef,
        pendingRef: internals.pendingRef,
        sessionRef: internals.sessionRef,
        workerARef: internals.workerARef,
        workerBRef: internals.workerBRef,
      },
      { setStabilityProgress: internals.setStabilityProgress }
    );
  }, [
    internals.workerARef,
    internals.setStabilityProgress,
    internals.sessionRef,
    internals.workerBRef,
    internals.pendingRef,
    internals.activeRunRef,
  ]);

  const doHandleRoundFinished = useCallback(() => {
    handleRoundFinished(
      internals.sessionRef,
      {
        setRunState: internals.setRunState,
        setStabilityProgress: internals.setStabilityProgress,
      },
      doStartRound,
      doFinalize
    );
  }, [
    doFinalize,
    doStartRound,
    internals.setStabilityProgress,
    internals.setRunState,
    internals.sessionRef,
  ]);

  return { doFinalize, doHandleRoundFinished, doStartRound };
}
