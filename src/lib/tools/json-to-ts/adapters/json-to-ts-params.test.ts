import { describe, expect, test } from 'vite-plus/test';

import {
  buildJsonToTsParams,
  buildJsonToTsStateFromSearch,
} from './json-to-ts-params';

describe('buildJsonToTsParams', () => {
  test('returns empty params for empty input', () => {
    expect(buildJsonToTsParams('').toString()).toBe('');
  });

  test('sets input when provided', () => {
    const params = buildJsonToTsParams('{"a":1}');
    expect(params.get('input')).toBe('{"a":1}');
    expect(params.toString()).toBe('input=%7B%22a%22%3A1%7D');
  });

  test('omits the param for whitespace-only input', () => {
    expect(buildJsonToTsParams('   ').toString()).toBe('');
  });
});

describe('buildJsonToTsStateFromSearch', () => {
  test('returns empty input for empty search', () => {
    expect(buildJsonToTsStateFromSearch({})).toBe('');
  });

  test('returns provided input', () => {
    expect(buildJsonToTsStateFromSearch({ input: '{"a":1}' })).toBe('{"a":1}');
  });
});
