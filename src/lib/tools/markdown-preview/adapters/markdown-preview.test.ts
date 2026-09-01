import { describe, expect, test } from 'vite-plus/test';

import { renderMarkdown } from './markdown-preview';

describe('renderMarkdown', () => {
  test('returns empty for empty input', () => {
    expect(renderMarkdown('')).toEqual({ html: '', isEmpty: true });
    expect(renderMarkdown('   ')).toEqual({ html: '', isEmpty: true });
  });

  test('renders a representative markdown document with GFM enabled', () => {
    const md = [
      '# Hello',
      '',
      '**bold** and *italic* and ~~strike~~',
      '',
      '[example](https://example.com)',
      '',
      '- item 1',
      '- [x] done',
      '',
      '| a | b |',
      '| --- | --- |',
      '| 1 | 2 |',
    ].join('\n');
    const result = renderMarkdown(md);

    expect(result.isEmpty).toBe(false);
    expect(result.html).toContain('<h1');
    expect(result.html).toContain('<strong>bold</strong>');
    expect(result.html).toContain('<del>strike</del>');
    expect(result.html).toContain('<a href="https://example.com">');
    expect(result.html).toContain('<li>item 1</li>');
    expect(result.html).toContain('type="checkbox"');
    expect(result.html).toContain('<table>');
  });

  test('sanitizes XSS via img onerror', () => {
    const result = renderMarkdown('<img src=x onerror=alert(1)>');
    expect(result.html).not.toContain('onerror');
    expect(result.html).not.toContain('alert(1)');
  });

  test('sanitizes script tags', () => {
    const result = renderMarkdown('<script>alert(1)</script>');
    expect(result.html).not.toContain('<script>');
    expect(result.html).not.toContain('alert(1)');
  });
});
