import {
  buildStabilitySummaryResult,
  type ExecutionResult,
} from '@/lib/js-perf-comp-core/models';
import {
  createExecutionRequest,
  type WorkerInboundMessage,
} from '@/lib/js-perf-comp-core/worker-api';

import type { ActiveRunState, StabilitySession } from './types';

type SessionRefs = {
  sessionRef: React.MutableRefObject<StabilitySession | null>;
  pendingRef: React.MutableRefObject<Set<string>>;
  activeRunRef: React.MutableRefObject<ActiveRunState>;
  workerARef: React.MutableRefObject<Worker | null>;
  workerBRef: React.MutableRefObject<Worker | null>;
};

type SessionSetters = {
  setResultA: (v: ExecutionResult | null) => void;
  setResultB: (v: ExecutionResult | null) => void;
  setRunState: (v: 'idle' | 'running' | 'done') => void;
  setStabilityProgress: (v: { current: number; total: number } | null) => void;
};

export function finalizeSession(
  sessionRef: React.MutableRefObject<StabilitySession | null>,
  setters: SessionSetters
) {
  const session = sessionRef.current;
  if (!session) {
    setters.setRunState('done');
    setters.setStabilityProgress(null);
    return;
  }
  if (session.mode === 'single') {
    setters.setRunState('done');
    setters.setStabilityProgress(null);
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
  setters.setResultA(summaryA);
  setters.setResultB(summaryB);
  setters.setRunState('done');
  setters.setStabilityProgress(null);
  sessionRef.current = null;
}

export function startSessionRound(
  refs: SessionRefs,
  setters: Pick<SessionSetters, 'setStabilityProgress'>
) {
  const session = refs.sessionRef.current;
  if (!session) {
    return;
  }
  if (!(refs.workerARef.current && refs.workerBRef.current)) {
    return;
  }
  const nextRound = session.roundsCompleted + 1;
  session.roundsCompleted = nextRound;

  if (session.mode === 'stability') {
    setters.setStabilityProgress({
      current: nextRound,
      total: session.roundsTotal,
    });
  } else {
    setters.setStabilityProgress(null);
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

  refs.activeRunRef.current = {
    a: { code: reqA.code, id: reqA.id },
    b: { code: reqB.code, id: reqB.id },
  };
  refs.pendingRef.current = new Set([reqA.id, reqB.id]);

  const msgA: WorkerInboundMessage = { payload: reqA, type: 'execute' };
  const msgB: WorkerInboundMessage = { payload: reqB, type: 'execute' };

  refs.workerARef.current.postMessage(msgA);
  refs.workerBRef.current.postMessage(msgB);
}

export function handleRoundFinished(
  sessionRef: React.MutableRefObject<StabilitySession | null>,
  setters: Pick<SessionSetters, 'setRunState' | 'setStabilityProgress'>,
  startRound: () => void,
  finalize: () => void
) {
  const session = sessionRef.current;
  if (!session) {
    setters.setRunState('done');
    setters.setStabilityProgress(null);
    return;
  }
  if (
    session.mode === 'stability' &&
    session.roundsCompleted < session.roundsTotal
  ) {
    startRound();
    return;
  }
  finalize();
}
