import {
  createWorkerErrorResult,
  type ExecutionResult,
} from '@/lib/js-perf-comp-core/models';

import type { ActiveRunState, StabilitySession } from './types';

type HandlerDeps = {
  pendingRef: React.MutableRefObject<Set<string>>;
  activeRunRef: React.MutableRefObject<ActiveRunState>;
  sessionRef: React.MutableRefObject<StabilitySession | null>;
  setResultA: (v: ExecutionResult | null) => void;
  setResultB: (v: ExecutionResult | null) => void;
  handleRoundFinished: () => void;
};

export function makeWorkerAResultHandler(deps: HandlerDeps) {
  return (id: string, result: ExecutionResult) => {
    if (!deps.pendingRef.current.has(id)) {
      return;
    }
    deps.pendingRef.current.delete(id);
    deps.activeRunRef.current.a = null;
    const session = deps.sessionRef.current;
    if (session?.mode === 'stability') {
      session.resultsA.push(result);
    } else {
      deps.setResultA(result);
    }
    if (deps.pendingRef.current.size === 0) {
      deps.handleRoundFinished();
    }
  };
}

export function makeWorkerBResultHandler(deps: HandlerDeps) {
  return (id: string, result: ExecutionResult) => {
    if (!deps.pendingRef.current.has(id)) {
      return;
    }
    deps.pendingRef.current.delete(id);
    deps.activeRunRef.current.b = null;
    const session = deps.sessionRef.current;
    if (session?.mode === 'stability') {
      session.resultsB.push(result);
    } else {
      deps.setResultB(result);
    }
    if (deps.pendingRef.current.size === 0) {
      deps.handleRoundFinished();
    }
  };
}

export function makeWorkerAErrorHandler(deps: HandlerDeps) {
  return (errorMessage: string | null) => {
    const runEntry = deps.activeRunRef.current.a;
    if (runEntry && deps.pendingRef.current.has(runEntry.id)) {
      deps.pendingRef.current.delete(runEntry.id);
      const fallback = createWorkerErrorResult(runEntry, errorMessage);
      if (fallback) {
        const session = deps.sessionRef.current;
        if (session?.mode === 'stability') {
          session.resultsA.push(fallback);
        } else {
          deps.setResultA(fallback);
        }
      }
    }
    deps.activeRunRef.current.a = null;
    if (deps.pendingRef.current.size === 0) {
      deps.handleRoundFinished();
    }
  };
}

export function makeWorkerBErrorHandler(deps: HandlerDeps) {
  return (errorMessage: string | null) => {
    const runEntry = deps.activeRunRef.current.b;
    if (runEntry && deps.pendingRef.current.has(runEntry.id)) {
      deps.pendingRef.current.delete(runEntry.id);
      const fallback = createWorkerErrorResult(runEntry, errorMessage);
      if (fallback) {
        const session = deps.sessionRef.current;
        if (session?.mode === 'stability') {
          session.resultsB.push(fallback);
        } else {
          deps.setResultB(fallback);
        }
      }
    }
    deps.activeRunRef.current.b = null;
    if (deps.pendingRef.current.size === 0) {
      deps.handleRoundFinished();
    }
  };
}
