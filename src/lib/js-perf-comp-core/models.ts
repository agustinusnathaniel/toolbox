export type ExecutionStatus =
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
  maxOutputLines: 100,
  defaultIterations: 30, // 30 timed iterations + 5 warmup = 35 total runs
};

export function normalizeResult(
  raw: Partial<ExecutionResult> & { id: string; code: string }
): ExecutionResult {
  return {
    id: raw.id,
    code: raw.code,
    status: raw.status ?? 'worker_error',
    durationMs: raw.durationMs ?? null,
    perIterationMs: raw.perIterationMs ?? null,
    statistics: raw.statistics ?? null,
    errorMessage: raw.errorMessage ?? null,
    output: raw.output ?? [],
  };
}

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

export function calculateStatistics(
  durations: Array<number>
): ExecutionStatistics {
  const n = durations.length;
  if (n === 0) {
    return {
      iterations: 0,
      minMs: 0,
      maxMs: 0,
      meanMs: 0,
      stddevMs: 0,
      marginMs: 0,
    };
  }

  const minMs = Math.min(...durations);
  const maxMs = Math.max(...durations);
  const meanMs = durations.reduce((a, b) => a + b, 0) / n;

  if (n === 1) {
    return { iterations: 1, minMs, maxMs, meanMs, stddevMs: 0, marginMs: 0 };
  }

  const squaredDiffs = durations.map((d) => (d - meanMs) ** 2);
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / n;
  const stddevMs = Math.sqrt(variance);

  // 95% confidence margin of error: z * (stddev / sqrt(n))
  // Using z-score approximation: 1.96 for n>30, otherwise 2.0 (conservative)
  const zValue = n > 30 ? 1.96 : 2.0;
  const marginMs = (zValue * stddevMs) / Math.sqrt(n);

  return { iterations: n, minMs, maxMs, meanMs, stddevMs, marginMs };
}

/**
 * Calculate robust statistics by:
 * 1. Removing outliers using IQR method (values outside 1.5 * IQR)
 * 2. Using median instead of mean (more robust to skewed distributions)
 *
 * This provides more stable results for performance benchmarking.
 */
export function calculateRobustStatistics(
  durations: Array<number>
): ExecutionStatistics {
  const n = durations.length;
  if (n === 0) {
    return {
      iterations: 0,
      minMs: 0,
      maxMs: 0,
      meanMs: 0,
      stddevMs: 0,
      marginMs: 0,
    };
  }

  if (n === 1) {
    return {
      iterations: 1,
      minMs: durations[0],
      maxMs: durations[0],
      meanMs: durations[0],
      stddevMs: 0,
      marginMs: 0,
    };
  }

  // Sort for percentile calculations
  const sorted = [...durations].sort((a, b) => a - b);

  // Calculate Q1 (25th percentile) and Q3 (75th percentile)
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];

  // Calculate IQR and outlier bounds
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Filter outliers
  const filtered = sorted.filter((d) => d >= lowerBound && d <= upperBound);

  // Fallback to unfiltered data if all values are outliers
  const data = filtered.length > 0 ? filtered : sorted;

  // Calculate median
  const mid = Math.floor(data.length / 2);
  const medianMs =
    data.length % 2 === 0 ? (data[mid - 1] + data[mid]) / 2 : data[mid];

  // Use median as the "mean" for display purposes
  const meanMs = medianMs;
  const first = data[0];
  const last = data.at(-1);
  const minMs = first === undefined ? 0 : first;
  const maxMs = last === undefined ? 0 : last;

  // Calculate standard deviation on filtered data
  const variance =
    data.reduce((sum, d) => sum + (d - meanMs) ** 2, 0) / data.length;
  const stddevMs = Math.sqrt(variance);

  // Calculate margin of error on filtered data
  const zValue = data.length > 30 ? 1.96 : 2.0;
  const marginMs = (zValue * stddevMs) / Math.sqrt(data.length);

  return {
    iterations: n, // Keep original iteration count for display
    minMs,
    maxMs,
    meanMs,
    stddevMs,
    marginMs,
  };
}
