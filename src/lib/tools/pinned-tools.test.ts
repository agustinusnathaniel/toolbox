import { describe, expect, test } from 'vite-plus/test';

import { parsePinnedTools, togglePinnedTool } from './pinned-tools';

describe('parsePinnedTools', () => {
  test('returns [] for non-array values', () => {
    expect(parsePinnedTools(undefined)).toEqual([]);
    expect(parsePinnedTools(null)).toEqual([]);
    expect(parsePinnedTools('x')).toEqual([]);
    expect(parsePinnedTools({ pinned: ['base64'] })).toEqual([]);
  });

  test('filters out non-string and empty entries', () => {
    expect(
      parsePinnedTools(['base64', 42, null, 'json-formatter', ''])
    ).toEqual(['base64', 'json-formatter']);
  });

  test('returns valid slugs in order', () => {
    expect(parsePinnedTools(['json-formatter', 'base64', 'ua-check'])).toEqual([
      'json-formatter',
      'base64',
      'ua-check',
    ]);
  });
});

describe('togglePinnedTool', () => {
  test('appends a new slug', () => {
    expect(togglePinnedTool(['base64'], 'json-formatter')).toEqual([
      'base64',
      'json-formatter',
    ]);
  });

  test('removes an existing slug', () => {
    expect(togglePinnedTool(['base64', 'json-formatter'], 'base64')).toEqual([
      'json-formatter',
    ]);
  });

  test('returns a new array without mutating the input', () => {
    const slugs = ['base64', 'json-formatter'];
    const result = togglePinnedTool(slugs, 'ua-check');
    expect(result).toEqual(['base64', 'json-formatter', 'ua-check']);
    expect(result).not.toBe(slugs);
    expect(slugs).toEqual(['base64', 'json-formatter']);

    const removed = togglePinnedTool(slugs, 'base64');
    expect(removed).toEqual(['json-formatter']);
    expect(removed).not.toBe(slugs);
    expect(slugs).toEqual(['base64', 'json-formatter']);
  });
});
