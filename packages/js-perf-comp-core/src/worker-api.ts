import type { ExecutionRequest, ExecutionResult } from "./models";

export type WorkerInboundMessage =
  | { type: "execute"; payload: ExecutionRequest }
  | { type: "terminate" };

export type WorkerOutboundMessage =
  | { type: "result"; payload: ExecutionResult }
  | { type: "ready" };

export function createExecutionRequest(code: string, deadlineMs: number): ExecutionRequest {
  return {
    id: crypto.randomUUID(),
    code,
    deadlineMs,
  };
}

export function parseWorkerMessage(data: unknown): WorkerOutboundMessage | null {
  if (typeof data !== "object" || data === null) return null;
  const msg = data as { type: string; payload?: unknown };
  if (msg.type === "ready") return { type: "ready" };
  if (msg.type === "result" && typeof msg.payload === "object") {
    return {
      type: "result",
      payload: msg.payload as ExecutionResult,
    };
  }
  return null;
}
