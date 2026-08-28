import { useRef } from 'react';

import type { ExecutionResult } from '@/lib/js-perf-comp-core/models';

import { useRunnerActions } from './runner-actions';
import type { RunState } from './types';
import { useRunnerInternals } from './use-runner-internals';
import { useSessionCallbacks } from './use-session-callbacks';
import { useWorkerSetup } from './use-worker-setup';

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
  stabilityProgress: { current: number; total: number } | null;
  terminate: () => void;
}

export function useJsPerfRunner(
  options: UseJsPerfRunnerOptions
): UseJsPerfRunnerReturn {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const internals = useRunnerInternals();
  const cbs = useSessionCallbacks(internals);
  const setupWorkers = useWorkerSetup(internals, cbs);
  const actions = useRunnerActions(
    optionsRef,
    internals,
    cbs.doStartRound,
    setupWorkers
  );
  return {
    isReady: internals.workerAReady && internals.workerBReady,
    reset: actions.reset,
    resultA: internals.resultA,
    resultB: internals.resultB,
    run: actions.run,
    runState: internals.runState,
    stabilityProgress: internals.stabilityProgress,
    terminate: actions.terminate,
  };
}
