import { describe, expect, test } from 'vite-plus/test';

import { buildBase64Params, buildBase64StateFromSearch } from './base64-params';

describe('buildBase64Params', () => {
  test('sets input when provided', () => {
    const params = buildBase64Params('input text');
    expect(params.get('input')).toBe('input text');
  });

  test('returns empty params when input is empty', () => {
    const params = buildBase64Params('');
    expect(params.toString()).toBe('');
  });

  test('skips whitespace-only input', () => {
    const params = buildBase64Params('   ');
    expect(params.get('input')).toBeNull();
  });
});

describe('buildBase64StateFromSearch', () => {
  test('returns empty string for empty search', () => {
    expect(buildBase64StateFromSearch({})).toBe('');
  });

  test('returns provided input', () => {
    expect(buildBase64StateFromSearch({ input: 'abc' })).toBe('abc');
  });
});
