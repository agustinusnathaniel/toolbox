/** Correlation ID plus tool-specific params for a worker request. */
export type WorkerRequest<T extends object = object> = { id: string } & T;

/** Correlation ID plus the computed result for a worker response. */
export type WorkerResponse<T> = { id: string; result: T };
