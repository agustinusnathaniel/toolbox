type ExecutionStatus =
  | 'success'
  | 'runtime_error'
  | 'timeout'
  | 'terminated'
  | 'worker_error';

export interface ExecutionStatistics {
  /** Number of iterations run */
  iterations: number;
  /** Margin of error at 95% confidence in ms */
  marginMs: number;
  /** Maximum duration in ms */
  maxMs: number;
  /** Mean duration in ms */
  meanMs: number;
  /** Minimum duration in ms */
  minMs: number;
  /** Standard deviation in ms */
  stddevMs: number;
}

export interface ExecutionResult {
  code: string;
  /** Wall-clock duration in milliseconds (total for all iterations) */
  durationMs: number | null;
  errorMessage: string | null;
  id: string;
  /** Raw output captured from console.log if any */
  output: Array<string>;
  /** Per-iteration duration in ms (durationMs / iterations) */
  perIterationMs: number | null;
  /** Statistics if iterations > 1 */
  statistics: ExecutionStatistics | null;
  status: ExecutionStatus;
}

export interface ExecutionRequest {
  code: string;
  deadlineMs: number;
  id: string;
  iterations: number;
  setup: string;
  teardown: string;
}

export interface RunPolicy {
  deadlineMs: number;
  defaultIterations: number;
  maxOutputLines: number;
}

export const DEFAULT_RUN_POLICY: RunPolicy = {
  deadlineMs: 5000,
  defaultIterations: 30, // 30 timed iterations + 5 warmup = 35 total runs
  maxOutputLines: 100,
};

export function isRunable(code: string): boolean {
  return code.trim().length > 0;
}

export function formatDuration(ms: number | null): string {
  if (ms === null) {
    return '—';
  }
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)} µs`;
  }
  if (ms < 1000) {
    return `${ms.toFixed(2)} ms`;
  }
  return `${(ms / 1000).toFixed(2)} s`;
}

function formatMs(value: number): string {
  if (value < 0.001) {
    return `${(value * 1_000_000).toFixed(2)} ns`;
  }
  if (value < 1) {
    return `${(value * 1000).toFixed(2)} µs`;
  }
  return `${value.toFixed(2)} ms`;
}

export function formatStatistics(stats: ExecutionStatistics): string {
  const { meanMs, marginMs, iterations } = stats;
  return `${formatMs(meanMs)} ±${formatMs(marginMs)} (${iterations} runs)`;
}

/**
 * Calculate robust statistics by:
 * 1. Removing outliers using IQR method (values outside 1.5 * IQR)
 * 2. Using median instead of mean (more robust to skewed distributions)
 *
 * This provides more stable results for performance benchmarking.
 */
function filterOutliers(sorted: Array<number>): Array<number> {
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  const filtered = sorted.filter((d) => d >= lower && d <= upper);
  return filtered.length > 0 ? filtered : sorted;
}

function calculateMedian(data: Array<number>): number {
  const mid = Math.floor(data.length / 2);
  return data.length % 2 === 0 ? (data[mid - 1] + data[mid]) / 2 : data[mid];
}

export function calculateRobustStatistics(
  durations: Array<number>
): ExecutionStatistics {
  const n = durations.length;
  if (n === 0) {
    return {
      iterations: 0,
      marginMs: 0,
      maxMs: 0,
      meanMs: 0,
      minMs: 0,
      stddevMs: 0,
    };
  }
  if (n === 1) {
    return {
      iterations: 1,
      marginMs: 0,
      maxMs: durations[0],
      meanMs: durations[0],
      minMs: durations[0],
      stddevMs: 0,
    };
  }
  const sorted = [...durations].sort((a, b) => a - b);
  const data = filterOutliers(sorted);
  const medianMs = calculateMedian(data);
  const meanMs = medianMs;
  const minMs = data[0] ?? 0;
  const maxMs = data.at(-1) ?? 0;
  const variance =
    data.reduce((sum, d) => sum + (d - meanMs) ** 2, 0) / data.length;
  const stddevMs = Math.sqrt(variance);
  const zValue = data.length > 30 ? 1.96 : 2.0;
  const marginMs = (zValue * stddevMs) / Math.sqrt(data.length);
  return { iterations: n, marginMs, maxMs, meanMs, minMs, stddevMs };
}

export function createWorkerErrorResult(
  runEntry: { code: string; id: string } | null,
  errorMessage: string | null
): ExecutionResult | null {
  if (!runEntry) {
    return null;
  }

  return {
    code: runEntry.code,
    durationMs: null,
    errorMessage: errorMessage ?? 'Worker crashed unexpectedly',
    id: runEntry.id,
    output: [],
    perIterationMs: null,
    statistics: null,
    status: 'worker_error',
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
      code,
      durationMs,
      errorMessage:
        `Stability mode had ${failed.length}/${rounds} failed rounds. ` +
        `First failure: ${firstFailure.errorMessage ?? firstFailure.status}.`,
      id: `${sideLabel.toLowerCase()}-stability-summary`,
      output: firstFailure.output,
      perIterationMs,
      statistics,
      status: firstFailure.status,
    };
  }

  const baseOutput = successful[0]?.output ?? [];
  const output =
    rounds > 1
      ? [`Stability mode summary: ${rounds} rounds aggregated.`, ...baseOutput]
      : baseOutput;

  return {
    code,
    durationMs,
    errorMessage: null,
    id: `${sideLabel.toLowerCase()}-stability-summary`,
    output,
    perIterationMs,
    statistics,
    status: 'success',
  };
}
