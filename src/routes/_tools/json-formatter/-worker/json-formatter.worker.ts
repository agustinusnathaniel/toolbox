import {
  formatJson,
  type JsonFormatterResult,
  minifyJson,
  validateJson,
} from '@/lib/tools/json-formatter/adapters/json-formatter';

export type JsonFormatterAction = 'format' | 'validate' | 'minify';

export interface JsonFormatterRequest {
  action: JsonFormatterAction;
  id: string;
  input: string;
}

export interface JsonFormatterResponse {
  id: string;
  result: JsonFormatterResult;
}

self.onmessage = (event: MessageEvent<JsonFormatterRequest>) => {
  const { id, input, action } = event.data;
  let result: JsonFormatterResult;
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
