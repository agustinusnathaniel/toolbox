import { marked } from 'marked';

marked.setOptions({
  breaks: false,
  gfm: true,
});

export function renderMarkdown(markdown: string): {
  html: string;
  isEmpty: boolean;
} {
  if (!markdown.trim()) {
    return { html: '', isEmpty: true };
  }
  const html = marked.parse(markdown, { gfm: true }) as string;
  return { html, isEmpty: false };
}
