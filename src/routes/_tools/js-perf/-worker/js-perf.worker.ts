import type { QuickJSContext, QuickJSRuntime } from 'quickjs-emscripten';
import { getQuickJS, shouldInterruptAfterDeadline } from 'quickjs-emscripten';

import type {
  ExecutionRequest,
  ExecutionResult,
  WorkerInboundMessage,
  WorkerOutboundMessage,
} from '@/lib/js-perf-comp-core';
import {
  calculateRobustStatistics,
  DEFAULT_RUN_POLICY,
} from '@/lib/js-perf-comp-core';

let quickjsModule: Awaited<ReturnType<typeof getQuickJS>> | null = null;

const WARMUP_ITERATIONS = 5;
const BENCHMARK_FUNCTION_NAME = '__toolboxPerfMain__';
const VM_MEMORY_LIMIT_BYTES = 64 * 1024 * 1024;
const VM_MAX_STACK_SIZE_BYTES = 2 * 1024 * 1024;

type BenchmarkPhase = 'setup' | 'compile' | 'warmup' | 'timed' | 'teardown';

interface PhaseFailure {
  message: string;
  phase: BenchmarkPhase;
  status: Extract<
    ExecutionResult['status'],
    'runtime_error' | 'timeout' | 'worker_error'
  >;
}

interface PhaseSuccess {
  ok: true;
}

interface PhaseFailureResult {
  failure: PhaseFailure;
  ok: false;
}

type PhaseOutcome = PhaseSuccess | PhaseFailureResult;

interface VmSession {
  context: QuickJSContext;
  output: Array<string>;
  outputTruncated: boolean;
  runtime: QuickJSRuntime;
}

interface BenchmarkRunOutcome {
  durations: Array<number>;
  failure: PhaseFailure | null;
  output: Array<string>;
}

async function initRuntime() {
  quickjsModule = await getQuickJS();
  const msg: WorkerOutboundMessage = { type: 'ready' };
  self.postMessage(msg);
}

function formatUnknownError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function isInterruptedError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('interrupted') ||
      error.name === 'InternalError' ||
      error.name.includes('Interrupt')
    );
  }

  const errorText = formatUnknownError(error);
  return errorText.includes('interrupted');
}

function describePhase(phase: BenchmarkPhase): string {
  switch (phase) {
    case 'setup':
      return 'setup';
    case 'compile':
      return 'snippet compile';
    case 'warmup':
      return 'warmup';
    case 'timed':
      return 'timed iteration';
    case 'teardown':
      return 'teardown';
    default:
      return phase;
  }
}

function createVmSession(maxOutputLines: number): VmSession | null {
  if (!quickjsModule) {
    return null;
  }

  const runtime = quickjsModule.newRuntime();
  runtime.setMemoryLimit(VM_MEMORY_LIMIT_BYTES);
  runtime.setMaxStackSize(VM_MAX_STACK_SIZE_BYTES);

  const context = runtime.newContext();
  const output: Array<string> = [];
  let outputTruncated = false;

  const logHandle = context.newFunction('log', (...args) => {
    if (output.length >= maxOutputLines) {
      outputTruncated = true;
      return;
    }

    const line = args
      .map((arg) => {
        const dumped = context.dump(arg);
        if (typeof dumped === 'string') {
          return dumped;
        }
        try {
          return JSON.stringify(dumped);
        } catch {
          return String(dumped);
        }
      })
      .join(' ');

    output.push(line);
  });

  const consoleHandle = context.newObject();
  context.setProp(consoleHandle, 'log', logHandle);
  context.setProp(context.global, 'console', consoleHandle);

  logHandle.dispose();
  consoleHandle.dispose();

  return { context, output, outputTruncated, runtime };
}

function disposeVmSession(session: VmSession): void {
  session.context.dispose();
  session.runtime.dispose();
}

function createBenchmarkFunctionSource(code: string): string {
  return `globalThis.${BENCHMARK_FUNCTION_NAME} = function toolboxPerfMain() {\n${code}\n};`;
}

function runSnippet(
  session: VmSession,
  code: string,
  deadlineMs: number,
  phase: BenchmarkPhase,
  fileName: string
): PhaseOutcome {
  try {
    session.runtime.setInterruptHandler(
      shouldInterruptAfterDeadline(Date.now() + deadlineMs)
    );
    const resultHandle = session.context.unwrapResult(
      session.context.evalCode(code, fileName)
    );
    resultHandle.dispose();
    return { ok: true };
  } catch (error) {
    const status: PhaseFailure['status'] = isInterruptedError(error)
      ? 'timeout'
      : 'runtime_error';
    const phaseLabel = describePhase(phase);
    return {
      failure: {
        message:
          status === 'timeout'
            ? `Execution timed out during ${phaseLabel} (>${deadlineMs}ms)`
            : `Execution failed during ${phaseLabel}: ${formatUnknownError(error)}`,
        phase,
        status,
      },
      ok: false,
    };
  }
}

function runMainIteration(
  session: VmSession,
  deadlineMs: number,
  phase: BenchmarkPhase,
  iteration: number,
  totalIterations: number
): PhaseOutcome {
  const fnHandle = session.context.getProp(
    session.context.global,
    BENCHMARK_FUNCTION_NAME
  );

  try {
    session.runtime.setInterruptHandler(
      shouldInterruptAfterDeadline(Date.now() + deadlineMs)
    );
    const resultHandle = session.context.unwrapResult(
      session.context.callFunction(fnHandle, session.context.undefined)
    );
    resultHandle.dispose();
    return { ok: true };
  } catch (error) {
    const status: PhaseFailure['status'] = isInterruptedError(error)
      ? 'timeout'
      : 'runtime_error';
    const phaseLabel = describePhase(phase);
    const iterationLabel = `${iteration}/${totalIterations}`;

    return {
      failure: {
        message:
          status === 'timeout'
            ? `Execution timed out during ${phaseLabel} ${iterationLabel} (>${deadlineMs}ms)`
            : `Execution failed during ${phaseLabel} ${iterationLabel}: ${formatUnknownError(error)}`,
        phase,
        status,
      },
      ok: false,
    };
  } finally {
    fnHandle.dispose();
  }
}

function executeBenchmark(payload: ExecutionRequest): BenchmarkRunOutcome {
  const session = createVmSession(DEFAULT_RUN_POLICY.maxOutputLines);

  if (!session) {
    return {
      durations: [],
      failure: {
        message: 'Runtime not initialized',
        phase: 'setup',
        status: 'worker_error',
      },
      output: [],
    };
  }

  try {
    const { code, deadlineMs, iterations, setup, teardown } = payload;

    if (setup.trim()) {
      const setupResult = runSnippet(
        session,
        setup,
        deadlineMs,
        'setup',
        'benchmark-setup.js'
      );
      if (!setupResult.ok) {
        return {
          durations: [],
          failure: setupResult.failure,
          output: session.output,
        };
      }
    }

    const compileResult = runSnippet(
      session,
      createBenchmarkFunctionSource(code),
      deadlineMs,
      'compile',
      'benchmark-main.js'
    );
    if (!compileResult.ok) {
      return {
        durations: [],
        failure: compileResult.failure,
        output: session.output,
      };
    }

    for (let i = 0; i < WARMUP_ITERATIONS; i += 1) {
      const warmupResult = runMainIteration(
        session,
        deadlineMs,
        'warmup',
        i + 1,
        WARMUP_ITERATIONS
      );
      if (!warmupResult.ok) {
        return {
          durations: [],
          failure: warmupResult.failure,
          output: session.output,
        };
      }
    }

    const durations: Array<number> = [];
    for (let i = 0; i < iterations; i += 1) {
      const start = performance.now();
      const timedResult = runMainIteration(
        session,
        deadlineMs,
        'timed',
        i + 1,
        iterations
      );

      if (!timedResult.ok) {
        return {
          durations,
          failure: timedResult.failure,
          output: session.output,
        };
      }

      durations.push(performance.now() - start);
    }

    if (teardown.trim()) {
      const teardownResult = runSnippet(
        session,
        teardown,
        deadlineMs,
        'teardown',
        'benchmark-teardown.js'
      );
      if (!teardownResult.ok) {
        return {
          durations,
          failure: teardownResult.failure,
          output: session.output,
        };
      }
    }

    if (session.outputTruncated) {
      session.output.push(
        `... output truncated at ${DEFAULT_RUN_POLICY.maxOutputLines} lines`
      );
    }

    return { durations, failure: null, output: session.output };
  } finally {
    disposeVmSession(session);
  }
}

function buildResult(
  payload: ExecutionRequest,
  status: ExecutionResult['status'],
  durations: Array<number>,
  output: Array<string>,
  errorMessage: string | null
): ExecutionResult {
  const totalDurationMs =
    durations.length > 0
      ? durations.reduce((sum, duration) => sum + duration, 0)
      : null;

  return {
    code: payload.code,
    durationMs: totalDurationMs,
    errorMessage,
    id: payload.id,
    output,
    perIterationMs:
      durations.length > 0 && totalDurationMs !== null
        ? totalDurationMs / durations.length
        : null,
    statistics:
      durations.length > 0 ? calculateRobustStatistics(durations) : null,
    status,
  };
}

function execute(payload: ExecutionRequest): void {
  if (!quickjsModule) {
    const result = buildResult(
      payload,
      'worker_error',
      [],
      [],
      'Runtime not initialized'
    );
    const msg: WorkerOutboundMessage = { payload: result, type: 'result' };
    self.postMessage(msg);
    return;
  }

  const { durations, failure, output } = executeBenchmark(payload);

  const status: ExecutionResult['status'] = failure
    ? failure.status
    : 'success';
  const result = buildResult(
    payload,
    status,
    durations,
    output,
    failure?.message ?? null
  );
  const msg: WorkerOutboundMessage = { payload: result, type: 'result' };
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
