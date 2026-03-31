export type ExecutionStatus =
  | "success"
  | "runtime_error"
  | "timeout"
  | "terminated"
  | "worker_error";

export interface ExecutionResult {
  id: string;
  code: string;
  status: ExecutionStatus;
  /** Wall-clock duration in milliseconds */
  durationMs: number | null;
  errorMessage: string | null;
  /** Raw output captured from console.log if any */
  output: string[];
}

export interface ExecutionRequest {
  id: string;
  code: string;
  deadlineMs: number;
}

export interface RunPolicy {
  deadlineMs: number;
  maxOutputLines: number;
}

export const DEFAULT_RUN_POLICY: RunPolicy = {
  deadlineMs: 5000,
  maxOutputLines: 100,
};

export function normalizeResult(
  raw: Partial<ExecutionResult> & { id: string; code: string },
): ExecutionResult {
  return {
    id: raw.id,
    code: raw.code,
    status: raw.status ?? "worker_error",
    durationMs: raw.durationMs ?? null,
    errorMessage: raw.errorMessage ?? null,
    output: raw.output ?? [],
  };
}

export function isRunable(code: string): boolean {
  return code.trim().length > 0;
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1) return "<1 ms";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
