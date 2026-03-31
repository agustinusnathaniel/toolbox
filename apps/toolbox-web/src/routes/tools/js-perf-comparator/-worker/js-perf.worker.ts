import type {
  ExecutionRequest,
  ExecutionResult,
  WorkerInboundMessage,
  WorkerOutboundMessage,
} from '@toolbox/js-perf-comp-core';
import { calculateStatistics } from '@toolbox/js-perf-comp-core';
import { getQuickJS, shouldInterruptAfterDeadline } from 'quickjs-emscripten';

let quickjsModule: Awaited<ReturnType<typeof getQuickJS>> | null = null;

async function initRuntime() {
  quickjsModule = await getQuickJS();
  const msg: WorkerOutboundMessage = { type: 'ready' };
  self.postMessage(msg);
}

function createWrappedCode(code: string): string {
  return `(function(console) {
  var _c = { log: function() { var a = Array.prototype.slice.call(arguments); console.log(a.map(function(v) { return String(v); }).join(' ')); } };
  try {
    ${code}
  } catch(e) {
    console.log('__ERROR__: ' + String(e));
  }
})`;
}

function runCode(code: string, deadlineMs: number): 'interrupted' | null {
  if (!quickjsModule) {
    return 'interrupted';
  }
  const result = quickjsModule.evalCode(code, {
    shouldInterrupt: shouldInterruptAfterDeadline(Date.now() + deadlineMs),
  });
  return result === 'interrupted' ? 'interrupted' : null;
}

function runBenchmarkIterations(
  code: string,
  iterations: number,
  deadlineMs: number
): { durations: Array<number>; hasTimeout: boolean; lastError: string | null } {
  const durations: Array<number> = [];
  let hasTimeout = false;
  let lastError: string | null = null;

  for (let i = 0; i < iterations && !hasTimeout; i++) {
    const iterStart = performance.now();
    const result = runCode(code, deadlineMs);

    if (result === 'interrupted') {
      hasTimeout = true;
      lastError = `Execution timed out after ${deadlineMs}ms`;
      break;
    }

    const iterDuration = performance.now() - iterStart;
    durations.push(iterDuration);
  }

  return { durations, hasTimeout, lastError };
}

function execute(payload: ExecutionRequest): void {
  if (!quickjsModule) {
    const result: ExecutionResult = {
      id: payload.id,
      code: payload.code,
      status: 'worker_error',
      durationMs: null,
      perIterationMs: null,
      statistics: null,
      errorMessage: 'Runtime not initialized',
      output: [],
    };
    const msg: WorkerOutboundMessage = { type: 'result', payload: result };
    self.postMessage(msg);
    return;
  }

  const { code, iterations, setup, teardown, deadlineMs } = payload;
  const wrappedSetup = setup ? createWrappedCode(setup) : null;
  const wrappedTeardown = teardown ? createWrappedCode(teardown) : null;
  const wrappedCode = createWrappedCode(code);
  const output: Array<string> = [];

  // Run setup once (not counted in timing)
  if (wrappedSetup) {
    try {
      runCode(wrappedSetup, deadlineMs);
    } catch {
      // Setup errors are ignored
    }
  }

  // Run main code iterations times
  const { durations, hasTimeout, lastError } = runBenchmarkIterations(
    wrappedCode,
    iterations,
    deadlineMs
  );

  // Run teardown once (not counted in timing)
  if (wrappedTeardown && !hasTimeout) {
    try {
      runCode(wrappedTeardown, deadlineMs);
    } catch {
      // Teardown errors are ignored
    }
  }

  const totalDurationMs =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0)
      : performance.now();

  const buildResultPayload = (
    status: ExecutionResult['status'],
    errorMsg: string | null
  ): ExecutionResult => ({
    id: payload.id,
    code: payload.code,
    status,
    durationMs: totalDurationMs,
    perIterationMs:
      durations.length > 0 ? totalDurationMs / durations.length : null,
    statistics: durations.length > 0 ? calculateStatistics(durations) : null,
    errorMessage: errorMsg,
    output,
  });

  if (hasTimeout) {
    const msg: WorkerOutboundMessage = {
      type: 'result',
      payload: buildResultPayload('timeout', lastError),
    };
    self.postMessage(msg);
    return;
  }

  if (lastError) {
    const msg: WorkerOutboundMessage = {
      type: 'result',
      payload: buildResultPayload('runtime_error', lastError),
    };
    self.postMessage(msg);
    return;
  }

  const msg: WorkerOutboundMessage = {
    type: 'result',
    payload: buildResultPayload('success', null),
  };
  self.postMessage(msg);
}

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const msg = event.data;
  if (msg.type === 'execute') {
    execute(msg.payload);
  }
};

initRuntime().catch(() => {
  // Worker failed to initialize - error will be reported via onerror
});
