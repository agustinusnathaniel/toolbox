import {
  type JsonToTsResult,
  jsonToTypescript,
} from '@/lib/tools/json-to-ts/adapters/json-to-ts';

export interface JsonToTsRequest {
  id: string;
  input: string;
}

export interface JsonToTsResponse {
  id: string;
  result: JsonToTsResult;
}

self.onmessage = (event: MessageEvent<JsonToTsRequest>) => {
  const { id, input } = event.data;
  const result = jsonToTypescript(input);
  const response: JsonToTsResponse = { id, result };
  self.postMessage(response);
};
