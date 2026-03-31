export type ExecutionStatus =
  | "success"
  | "runtime_error"
  | "timeout"
  | "terminated"
  | "worker_error";

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
  defaultIterations: 10,
};

export function normalizeResult(
  raw: Partial<ExecutionResult> & { id: string; code: string },
): ExecutionResult {
  return {
    id: raw.id,
    code: raw.code,
    status: raw.status ?? "worker_error",
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
  if (ms === null) return "—";
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
