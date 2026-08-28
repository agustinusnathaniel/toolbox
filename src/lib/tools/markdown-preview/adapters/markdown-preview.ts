import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({ breaks: false, gfm: true });

export function renderMarkdown(markdown: string): {
  html: string;
  isEmpty: boolean;
} {
  if (!markdown.trim()) {
    return { html: '', isEmpty: true };
  }
  const raw = marked.parse(markdown, { gfm: true }) as string;
  // DOMPurify requires window; guard for SSR/test
  const html = typeof window === 'undefined' ? raw : DOMPurify.sanitize(raw);
  return { html, isEmpty: false };
}
