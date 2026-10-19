import { describe, expect, test } from 'vite-plus/test';

import {
  buildUnicodeParams,
  buildUnicodeStateFromSearch,
} from './unicode-params';

describe('buildUnicodeParams', () => {
  test('builds params with input', () => {
    const params = buildUnicodeParams('Hello 😀');
    expect(params.get('input')).toBe('Hello 😀');
  });

  test('omits input when blank', () => {
    const params = buildUnicodeParams('   ');
    expect(params.has('input')).toBe(false);
  });

  test('keeps numeric-looking input as a string', () => {
    const params = buildUnicodeParams('123');
    expect(params.get('input')).toBe('123');
  });
});

describe('buildUnicodeStateFromSearch', () => {
  test('restores input from search', () => {
    expect(buildUnicodeStateFromSearch({ input: 'Hi!' })).toEqual({
      input: 'Hi!',
    });
  });

  test('defaults missing input to empty', () => {
    expect(buildUnicodeStateFromSearch({})).toEqual({ input: '' });
  });

  test('reads numeric-looking input as a string', () => {
    expect(buildUnicodeStateFromSearch({ input: '123' })).toEqual({
      input: '123',
    });
  });
});
