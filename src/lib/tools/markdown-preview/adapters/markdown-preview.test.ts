import { describe, expect, test } from 'vite-plus/test';

import { renderMarkdown } from './markdown-preview';

describe('renderMarkdown', () => {
  test('returns empty for empty input', () => {
    expect(renderMarkdown('')).toEqual({ html: '', isEmpty: true });
    expect(renderMarkdown('   ')).toEqual({ html: '', isEmpty: true });
  });

  test('renders headings', () => {
    const result = renderMarkdown('# Hello\n## World');
    expect(result.isEmpty).toBe(false);
    expect(result.html).toContain('<h1');
    expect(result.html).toContain('Hello');
    expect(result.html).toContain('<h2');
    expect(result.html).toContain('World');
  });

  test('renders bold and italic', () => {
    const result = renderMarkdown('**bold** and *italic*');
    expect(result.html).toContain('<strong>bold</strong>');
    expect(result.html).toContain('<em>italic</em>');
  });

  test('renders strikethrough via GFM', () => {
    const result = renderMarkdown('~~strike~~');
    expect(result.html).toContain('<del>strike</del>');
  });

  test('renders links and autolinks', () => {
    const result = renderMarkdown('[example](https://example.com)');
    expect(result.html).toContain('<a href="https://example.com">example</a>');
    const auto = renderMarkdown('https://example.com');
    expect(auto.html).toContain('<a href="https://example.com">');
  });

  test('renders code blocks', () => {
    const result = renderMarkdown('```js\nconst x = 1;\n```');
    expect(result.html).toContain('<code');
    expect(result.html).toContain('const x = 1;');
    const inline = renderMarkdown('`inline`');
    expect(inline.html).toContain('<code>inline</code>');
  });

  test('renders lists and task lists', () => {
    const result = renderMarkdown('- item 1\n- item 2');
    expect(result.html).toContain('<ul>');
    expect(result.html).toContain('<li>item 1</li>');
    const ordered = renderMarkdown('1. first\n2. second');
    expect(ordered.html).toContain('<ol>');
    const tasks = renderMarkdown('- [x] done\n- [ ] todo');
    expect(tasks.html).toContain('type="checkbox"');
  });

  test('renders tables via GFM', () => {
    const md = '| a | b |\n| --- | --- |\n| 1 | 2 |';
    const result = renderMarkdown(md);
    expect(result.html).toContain('<table>');
    expect(result.html).toContain('<th');
    expect(result.html).toContain('<td>1</td>');
  });

  test('renders blockquote', () => {
    const result = renderMarkdown('> quote');
    expect(result.html).toContain('<blockquote>');
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
