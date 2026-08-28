import { renderMarkdown } from '@/lib/tools/markdown-preview/adapters/markdown-preview';

export interface MarkdownPreviewRequest {
  id: string;
  input: string;
}

export interface MarkdownPreviewResponse {
  id: string;
  result: { html: string; isEmpty: boolean };
}

self.onmessage = (event: MessageEvent<MarkdownPreviewRequest>) => {
  const { id, input } = event.data;
  const result = renderMarkdown(input);
  const response: MarkdownPreviewResponse = { id, result };
  self.postMessage(response);
};
