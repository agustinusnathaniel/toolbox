export type ExecutionStatus =
  | 'success'
  | 'runtime_error'
  | 'timeout'
  | 'terminated'
  | 'worker_error';

export interface ExecutionStatistics {
  /** Number of iterations run */
  iterations: number;
  /** Minimum duration in ms */
  minMs: number;
  /** Maximum duration in ms */
  maxMs: number;
  /** Mean duration in ms */
  meanMs: number;
  /** Standard deviation in ms */
  stddevMs: number;
  /** Margin of error at 95% confidence in ms */
  marginMs: number;
}

export interface ExecutionResult {
  id: string;
  code: string;
  status: ExecutionStatus;
  /** Wall-clock duration in milliseconds (total for all iterations) */
  durationMs: number | null;
  /** Per-iteration duration in ms (durationMs / iterations) */
  perIterationMs: number | null;
  /** Statistics if iterations > 1 */
  statistics: ExecutionStatistics | null;
  errorMessage: string | null;
  /** Raw output captured from console.log if any */
  output: string[];
}

export interface ExecutionRequest {
  id: string;
  code: string;
  deadlineMs: number;
  iterations: number;
  setup: string;
  teardown: string;
}

export interface RunPolicy {
  deadlineMs: number;
  maxOutputLines: number;
  defaultIterations: number;
}

export const DEFAULT_RUN_POLICY: RunPolicy = {
  deadlineMs: 5000,
  maxOutputLines: 100,
  defaultIterations: 30, // 30 timed iterations + 5 warmup = 35 total runs
};

export function normalizeResult(
  raw: Partial<ExecutionResult> & { id: string; code: string },
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
  if (ms === null) return '—';
  if (ms < 1) return `${(ms * 1000).toFixed(2)} µs`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatStatistics(stats: ExecutionStatistics): string {
  const { meanMs, marginMs, iterations } = stats;
  const marginStr =
    marginMs < 0.001
      ? `±${(marginMs * 1000000).toFixed(2)} ns`
      : marginMs < 1
        ? `±${(marginMs * 1000).toFixed(2)} µs`
        : `±${marginMs.toFixed(2)} ms`;
  const meanStr =
    meanMs < 0.001
      ? `${(meanMs * 1000000).toFixed(2)} ns`
      : meanMs < 1
        ? `${(meanMs * 1000).toFixed(2)} µs`
        : `${meanMs.toFixed(2)} ms`;
  return `${meanStr} ${marginStr} (${iterations} runs)`;
}

export function calculateStatistics(durations: number[]): ExecutionStatistics {
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
export function calculateRobustStatistics(durations: number[]): ExecutionStatistics {
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

  // Calculate median
  const mid = Math.floor(filtered.length / 2);
  const medianMs =
    filtered.length % 2 === 0 ? (filtered[mid - 1] + filtered[mid]) / 2 : filtered[mid];

  // Use median as the "mean" for display purposes
  const meanMs = medianMs;
  const minMs = filtered[0];
  const maxMs = filtered[filtered.length - 1];

  // Calculate standard deviation on filtered data
  const variance = filtered.reduce((sum, d) => sum + (d - meanMs) ** 2, 0) / filtered.length;
  const stddevMs = Math.sqrt(variance);

  // Calculate margin of error on filtered data
  const zValue = filtered.length > 30 ? 1.96 : 2.0;
  const marginMs = (zValue * stddevMs) / Math.sqrt(filtered.length);

  return {
    iterations: n, // Keep original iteration count for display
    minMs,
    maxMs,
    meanMs,
    stddevMs,
    marginMs,
  };
}
