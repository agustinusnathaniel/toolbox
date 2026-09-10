import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import { renderMarkdown } from '@/lib/tools/markdown-preview/adapters/markdown-preview';

export type MarkdownPreviewRequest = WorkerRequest<{ input: string }>;

export type MarkdownPreviewResponse = WorkerResponse<{
  html: string;
  isEmpty: boolean;
}>;

self.onmessage = (event: MessageEvent<MarkdownPreviewRequest>) => {
  const { id, input } = event.data;
  const result = renderMarkdown(input);
  const response: MarkdownPreviewResponse = { id, result };
  self.postMessage(response);
};
