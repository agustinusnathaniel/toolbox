import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  type JsonToTsResult,
  jsonToTypescript,
} from '@/lib/tools/json-to-ts/adapters/json-to-ts';

export type JsonToTsRequest = WorkerRequest<{ input: string }>;

export type JsonToTsResponse = WorkerResponse<JsonToTsResult>;

self.onmessage = (event: MessageEvent<JsonToTsRequest>) => {
  const { id, input } = event.data;
  const result = jsonToTypescript(input);
  const response: JsonToTsResponse = { id, result };
  self.postMessage(response);
};
