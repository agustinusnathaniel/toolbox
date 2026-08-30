import { describe, expect, test } from 'vite-plus/test';

import {
  buildTextStatsParams,
  buildTextStatsStateFromSearch,
} from './text-stats-params';

describe('buildTextStatsParams', () => {
  test('empty input returns empty params', () => {
    expect(buildTextStatsParams('').toString()).toBe('');
  });

  test('whitespace only returns empty', () => {
    expect(buildTextStatsParams('   ').toString()).toBe('');
  });

  test('sets input when provided', () => {
    const p = buildTextStatsParams('hello world');
    expect(p.get('input')).toBe('hello world');
  });

  test('preserves numeric string', () => {
    const p = buildTextStatsParams('123');
    expect(p.get('input')).toBe('123');
  });

  test('preserves multiline', () => {
    const p = buildTextStatsParams('a\nb');
    expect(p.get('input')).toBe('a\nb');
  });
});

describe('buildTextStatsStateFromSearch', () => {
  test('empty search gives empty input', () => {
    expect(buildTextStatsStateFromSearch({})).toEqual({ input: '' });
  });

  test('returns provided input', () => {
    expect(buildTextStatsStateFromSearch({ input: 'hi' })).toEqual({
      input: 'hi',
    });
  });

  test('handles undefined', () => {
    expect(buildTextStatsStateFromSearch({ input: undefined })).toEqual({
      input: '',
    });
  });
});
