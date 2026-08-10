import { describe, expect, test } from 'vite-plus/test';

import { buildRegexParams, buildRegexStateFromSearch } from './regex-params';

describe('buildRegexParams', () => {
  test('sets all params when all values are provided', () => {
    const params = buildRegexParams('cat', 'g', 'input text');
    expect(params.get('pattern')).toBe('cat');
    expect(params.get('flags')).toBe('g');
    expect(params.get('input')).toBe('input text');
  });

  test('returns empty params when all values are empty', () => {
    const params = buildRegexParams('', '', '');
    expect(params.toString()).toBe('');
  });

  test('skips whitespace-only pattern and flags', () => {
    const params = buildRegexParams('   ', ' ', 'text');
    expect(params.get('pattern')).toBeNull();
    expect(params.get('flags')).toBeNull();
    expect(params.get('input')).toBe('text');
  });

  test('skips input when empty', () => {
    const params = buildRegexParams('cat', 'i', '');
    expect(params.get('pattern')).toBe('cat');
    expect(params.get('flags')).toBe('i');
    expect(params.get('input')).toBeNull();
  });
});

describe('buildRegexStateFromSearch', () => {
  test('returns empty strings for empty search', () => {
    const state = buildRegexStateFromSearch({});
    expect(state).toEqual({ flags: '', input: '', pattern: '' });
  });

  test('returns provided values with defaults for missing ones', () => {
    const state = buildRegexStateFromSearch({ flags: 'i', pattern: 'x' });
    expect(state).toEqual({ flags: 'i', input: '', pattern: 'x' });
  });

  test('returns all provided values', () => {
    const state = buildRegexStateFromSearch({
      flags: 'g',
      input: 'yy',
      pattern: 'x',
    });
    expect(state).toEqual({ flags: 'g', input: 'yy', pattern: 'x' });
  });
});
