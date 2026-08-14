import { describe, expect, test } from 'vite-plus/test';

import { buildCaseParams, buildCaseStateFromSearch } from './case-params';

describe('buildCaseParams', () => {
  test('returns empty params for empty input', () => {
    expect(buildCaseParams('').toString()).toBe('');
  });

  test('sets input when provided', () => {
    const params = buildCaseParams('hello world');
    expect(params.get('input')).toBe('hello world');
    expect(params.toString()).toBe('input=hello+world');
  });

  test('omits the param for whitespace-only input', () => {
    expect(buildCaseParams('   ').toString()).toBe('');
  });
});

describe('buildCaseStateFromSearch', () => {
  test('returns empty input for empty search', () => {
    expect(buildCaseStateFromSearch({})).toEqual({ input: '' });
  });

  test('returns provided input', () => {
    expect(buildCaseStateFromSearch({ input: 'abc' })).toEqual({
      input: 'abc',
    });
  });
});
