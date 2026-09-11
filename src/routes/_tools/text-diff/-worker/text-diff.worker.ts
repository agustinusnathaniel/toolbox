import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  diffTexts,
  type TextDiffResult,
} from '@/lib/tools/text-diff/adapters/text-diff';

export type TextDiffRequest = WorkerRequest<{
  modified: string;
  original: string;
}>;

export type TextDiffResponse = WorkerResponse<TextDiffResult>;

self.onmessage = (event: MessageEvent<TextDiffRequest>) => {
  const { id, modified, original } = event.data;
  const result = diffTexts(original, modified);
  const response: TextDiffResponse = { id, result };
  self.postMessage(response);
};
