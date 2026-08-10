import { describe, expect, test } from 'vite-plus/test';

import { buildJsonParams, buildJsonStateFromSearch } from './json-params';

describe('buildJsonParams', () => {
  test('sets input when input is non-empty', () => {
    const params = buildJsonParams('{"a":1}');
    expect(params.get('input')).toBe('{"a":1}');
  });

  test('returns empty params when input is blank', () => {
    const params = buildJsonParams('');
    expect(params.has('input')).toBe(false);
  });

  test('returns empty params for whitespace-only input', () => {
    const params = buildJsonParams('   ');
    expect(params.has('input')).toBe(false);
  });

  test('encodes special characters', () => {
    const params = buildJsonParams('{"a":1}');
    expect(params.toString()).toBe('input=%7B%22a%22%3A1%7D');
  });
});

describe('buildJsonStateFromSearch', () => {
  test('returns the input value', () => {
    expect(buildJsonStateFromSearch({ input: '{"a":1}' })).toBe('{"a":1}');
  });

  test('returns empty string when input is absent', () => {
    expect(buildJsonStateFromSearch({})).toBe('');
  });
});
