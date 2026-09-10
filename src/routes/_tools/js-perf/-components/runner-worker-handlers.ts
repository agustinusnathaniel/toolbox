import {
  createWorkerErrorResult,
  type ExecutionResult,
} from '@/lib/js-perf-comp-core/models';

import type { ActiveRunState, StabilitySession } from './types';

type Slot = 'a' | 'b';

type HandlerDeps = {
  pendingRef: React.MutableRefObject<Set<string>>;
  activeRunRef: React.MutableRefObject<ActiveRunState>;
  sessionRef: React.MutableRefObject<StabilitySession | null>;
  setResultA: (v: ExecutionResult | null) => void;
  setResultB: (v: ExecutionResult | null) => void;
  handleRoundFinished: () => void;
};

export function makeWorkerHandlers(deps: HandlerDeps, slot: Slot) {
  const setResult = slot === 'a' ? deps.setResultA : deps.setResultB;
  const resultsKey = slot === 'a' ? 'resultsA' : 'resultsB';

  return {
    onError: (errorMessage: string | null) => {
      const runEntry = deps.activeRunRef.current[slot];
      if (runEntry && deps.pendingRef.current.has(runEntry.id)) {
        deps.pendingRef.current.delete(runEntry.id);
        const fallback = createWorkerErrorResult(runEntry, errorMessage);
        if (fallback) {
          const session = deps.sessionRef.current;
          if (session?.mode === 'stability') {
            session[resultsKey].push(fallback);
          } else {
            setResult(fallback);
          }
        }
      }
      deps.activeRunRef.current[slot] = null;
      if (deps.pendingRef.current.size === 0) {
        deps.handleRoundFinished();
      }
    },
    onResult: (id: string, result: ExecutionResult) => {
      if (!deps.pendingRef.current.has(id)) {
        return;
      }
      deps.pendingRef.current.delete(id);
      deps.activeRunRef.current[slot] = null;
      const session = deps.sessionRef.current;
      if (session?.mode === 'stability') {
        session[resultsKey].push(result);
      } else {
        setResult(result);
      }
      if (deps.pendingRef.current.size === 0) {
        deps.handleRoundFinished();
      }
    },
  };
}
