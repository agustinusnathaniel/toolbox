import type { ExecutionResult } from '@/lib/js-perf-comp-core';

export interface Preset {
  codeA: string;
  codeB: string;
  description: string;
  name: string;
}

export type RunState = 'idle' | 'running' | 'done';
type RunMode = 'single' | 'stability';

interface ActiveRunEntry {
  code: string;
  id: string;
}

export interface ActiveRunState {
  a: ActiveRunEntry | null;
  b: ActiveRunEntry | null;
}

export interface StabilitySession {
  codeA: string;
  codeB: string;
  deadlineMs: number;
  iterations: number;
  mode: RunMode;
  resultsA: Array<ExecutionResult>;
  resultsB: Array<ExecutionResult>;
  roundsCompleted: number;
  roundsTotal: number;
  setupA: string;
  setupB: string;
  teardownA: string;
  teardownB: string;
}
