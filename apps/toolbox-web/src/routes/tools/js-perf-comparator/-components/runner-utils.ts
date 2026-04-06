import {
  calculateRobustStatistics,
  type ExecutionResult,
  parseWorkerMessage,
  type WorkerOutboundMessage,
} from '@toolbox/js-perf-comp-core';
import type { RefObject } from 'react';

import JsPerfWorker from '../-worker/js-perf.worker.ts?worker';
import type { ActiveRunEntry } from './types';

export function createWorkerErrorResult(
  runEntry: ActiveRunEntry | null,
  errorMessage: string | null
): ExecutionResult | null {
  if (!runEntry) {
    return null;
  }

  return {
    id: runEntry.id,
    code: runEntry.code,
    status: 'worker_error',
    durationMs: null,
    perIterationMs: null,
    statistics: null,
    errorMessage: errorMessage ?? 'Worker crashed unexpectedly',
    output: [],
  };
}

export function buildStabilitySummaryResult(
  code: string,
  iterations: number,
  rounds: number,
  results: Array<ExecutionResult>,
  sideLabel: 'A' | 'B'
): ExecutionResult {
  const successful = results.filter(
    (result): result is ExecutionResult & { perIterationMs: number } =>
      result.status === 'success' && result.perIterationMs !== null
  );

  const failed = results.filter((result) => result.status !== 'success');
  const roundDurations = successful.map((result) => result.perIterationMs);
  const statistics =
    roundDurations.length > 0
      ? calculateRobustStatistics(roundDurations)
      : null;
  const perIterationMs = statistics?.meanMs ?? null;
  const durationMs =
    perIterationMs === null ? null : perIterationMs * Math.max(iterations, 1);

  if (failed.length > 0) {
    const firstFailure = failed[0];
    return {
      id: `${sideLabel.toLowerCase()}-stability-summary`,
      code,
      status: firstFailure.status,
      durationMs,
      perIterationMs,
      statistics,
      errorMessage:
        `Stability mode had ${failed.length}/${rounds} failed rounds. ` +
        `First failure: ${firstFailure.errorMessage ?? firstFailure.status}.`,
      output: firstFailure.output,
    };
  }

  const baseOutput = successful[0]?.output ?? [];
  const output =
    rounds > 1
      ? [`Stability mode summary: ${rounds} rounds aggregated.`, ...baseOutput]
      : baseOutput;

  return {
    id: `${sideLabel.toLowerCase()}-stability-summary`,
    code,
    status: 'success',
    durationMs,
    perIterationMs,
    statistics,
    errorMessage: null,
    output,
  };
}

export function buildWorker(
  workerRef: RefObject<Worker | null>,
  workerIdRef: RefObject<number>,
  onReady: () => void,
  onResult: (id: string, result: ExecutionResult) => void,
  onError: (errorMessage: string | null) => void
) {
  const currentId = ++workerIdRef.current;
  const worker = new JsPerfWorker();

  worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
    if (workerIdRef.current !== currentId) {
      return;
    }
    const msg = parseWorkerMessage(event.data);
    if (!msg) {
      return;
    }
    if (msg.type === 'ready') {
      onReady();
      return;
    }
    if (msg.type === 'result') {
      onResult(msg.payload.id, msg.payload);
    }
  };

  worker.onerror = (event: ErrorEvent) => {
    if (workerIdRef.current !== currentId) {
      return;
    }
    onError(event.message || null);
  };

  workerRef.current = worker;
}
