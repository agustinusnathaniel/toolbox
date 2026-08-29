import { useRef, useState } from 'react';

import type { ExecutionResult } from '@/lib/js-perf-comp-core/models';
import { DEFAULT_RUN_POLICY } from '@/lib/js-perf-comp-core/models';

import type { ActiveRunState, RunState, StabilitySession } from './types';

export function useRunnerInternals() {
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

  return {
    activeRunRef,
    deadlineRef,
    pendingRef,
    resultA,
    resultB,
    runState,
    sessionRef,
    setResultA,
    setResultB,
    setRunState,
    setStabilityProgress,
    setWorkerAReady,
    setWorkerBReady,
    stabilityProgress,
    workerAIdRef,
    workerAReady,
    workerARef,
    workerBIdRef,
    workerBReady,
    workerBRef,
  };
}
