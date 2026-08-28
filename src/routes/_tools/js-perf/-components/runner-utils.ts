import type { RefObject } from 'react';

import type { ExecutionResult } from '@/lib/js-perf-comp-core/models';
import {
  parseWorkerMessage,
  type WorkerOutboundMessage,
} from '@/lib/js-perf-comp-core/worker-api';

import JsPerfWorker from '../-worker/js-perf.worker.ts?worker';

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
