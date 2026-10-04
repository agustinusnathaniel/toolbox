import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  formatJson,
  minifyJson,
  validateJson,
} from '@/lib/tools/json-formatter/adapters/json-formatter';
import type { TransformResult } from '@/lib/utils/transform';

export type JsonFormatterAction = 'format' | 'validate' | 'minify';

export type JsonFormatterRequest = WorkerRequest<{
  action: JsonFormatterAction;
  input: string;
}>;

export type JsonFormatterResponse = WorkerResponse<TransformResult>;

self.onmessage = (event: MessageEvent<JsonFormatterRequest>) => {
  const { id, input, action } = event.data;
  let result: TransformResult;
  switch (action) {
    case 'format':
      result = formatJson(input);
      break;
    case 'validate':
      result = validateJson(input);
      break;
    case 'minify':
      result = minifyJson(input);
      break;
    default:
      result = formatJson(input);
      break;
  }
  const response: JsonFormatterResponse = { id, result };
  self.postMessage(response);
};
