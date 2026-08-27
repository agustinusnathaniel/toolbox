import { describe, expect, test } from 'vite-plus/test';

import {
  buildMarkdownParams,
  buildMarkdownStateFromSearch,
} from './markdown-params';

describe('buildMarkdownParams', () => {
  test('omits param for empty and whitespace input', () => {
    expect(buildMarkdownParams('').toString()).toBe('');
    expect(buildMarkdownParams('   ').toString()).toBe('');
  });

  test('sets input for non-empty value', () => {
    const params = buildMarkdownParams('# Hello');
    expect(params.get('input')).toBe('# Hello');
  });
});

describe('buildMarkdownStateFromSearch', () => {
  test('returns defaults for empty search', () => {
    expect(buildMarkdownStateFromSearch({})).toEqual({ input: '' });
  });

  test('returns provided input', () => {
    expect(buildMarkdownStateFromSearch({ input: 'hi' })).toEqual({
      input: 'hi',
    });
  });

  test('round-trip preserves input', () => {
    const input = '# Title\n\n**bold** [link](https://example.com)';
    const params = buildMarkdownParams(input);
    const search = Object.fromEntries(params.entries());
    const state = buildMarkdownStateFromSearch(search);
    expect(state.input).toBe(input);
  });
});
