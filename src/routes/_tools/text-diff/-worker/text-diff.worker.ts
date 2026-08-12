import {
  diffTexts,
  type TextDiffResult,
} from '@/lib/tools/text-diff/adapters/text-diff';

export interface TextDiffRequest {
  id: string;
  modified: string;
  original: string;
}

export interface TextDiffResponse {
  id: string;
  result: TextDiffResult;
}

self.onmessage = (event: MessageEvent<TextDiffRequest>) => {
  const { id, modified, original } = event.data;
  const result = diffTexts(original, modified);
  const response: TextDiffResponse = { id, result };
  self.postMessage(response);
};
