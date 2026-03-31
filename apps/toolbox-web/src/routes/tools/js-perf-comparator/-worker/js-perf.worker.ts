import type {
  ExecutionRequest,
  ExecutionResult,
  WorkerInboundMessage,
  WorkerOutboundMessage,
} from '@toolbox/js-perf-comp-core';
import { getQuickJS, shouldInterruptAfterDeadline } from 'quickjs-emscripten';

let quickjsModule: Awaited<ReturnType<typeof getQuickJS>> | null = null;

async function initRuntime() {
  quickjsModule = await getQuickJS();
  const msg: WorkerOutboundMessage = { type: 'ready' };
  self.postMessage(msg);
}

function execute(payload: ExecutionRequest): void {
  if (!quickjsModule) {
    const result: ExecutionResult = {
      id: payload.id,
      code: payload.code,
      status: 'worker_error',
      durationMs: null,
      errorMessage: 'Runtime not initialized',
      output: [],
    };
    const msg: WorkerOutboundMessage = { type: 'result', payload: result };
    self.postMessage(msg);
    return;
  }

  const start = performance.now();

  const wrappedCode = `
(function(console) {
  var _console = { log: function() { var args = Array.prototype.slice.call(arguments); console.log(args.map(function(a) { return String(a); }).join(' ')); } };
  try {
        ${payload.code}
  } catch(e) {
    console.log('__ERROR__: ' + String(e));
  }
})
  `;

  try {
    const evalResult = quickjsModule.evalCode(wrappedCode, {
      shouldInterrupt: shouldInterruptAfterDeadline(
        Date.now() + payload.deadlineMs
      ),
    });

    const durationMs = performance.now() - start;

    if (evalResult === 'interrupted') {
      const resultPayload: ExecutionResult = {
        id: payload.id,
        code: payload.code,
        status: 'timeout',
        durationMs,
        errorMessage: `Execution timed out after ${payload.deadlineMs}ms`,
        output: [],
      };
      const msg: WorkerOutboundMessage = {
        type: 'result',
        payload: resultPayload,
      };
      self.postMessage(msg);
      return;
    }

    const resultPayload: ExecutionResult = {
      id: payload.id,
      code: payload.code,
      status: 'success',
      durationMs,
      errorMessage: null,
      output: [],
    };
    const msg: WorkerOutboundMessage = {
      type: 'result',
      payload: resultPayload,
    };
    self.postMessage(msg);
  } catch (err) {
    const durationMs = performance.now() - start;
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isInterrupt =
      errorMessage.includes('interrupted') || errorMessage.includes('timeout');

    const resultPayload: ExecutionResult = {
      id: payload.id,
      code: payload.code,
      status: isInterrupt ? 'timeout' : 'runtime_error',
      durationMs,
      errorMessage,
      output: [],
    };
    const msg: WorkerOutboundMessage = {
      type: 'result',
      payload: resultPayload,
    };
    self.postMessage(msg);
  }
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
