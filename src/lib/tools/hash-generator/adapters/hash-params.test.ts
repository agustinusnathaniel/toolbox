import { describe, expect, test } from 'vite-plus/test';

import { buildHashParams, buildHashStateFromSearch } from './hash-params';

describe('buildHashParams', () => {
  test('sets text and algorithm when both provided', () => {
    const params = buildHashParams('hello', 'SHA-512');
    expect(params.get('text')).toBe('hello');
    expect(params.get('algorithm')).toBe('SHA-512');
  });

  test('omits algorithm when it is the default SHA-256', () => {
    const params = buildHashParams('hello', 'SHA-256');
    expect(params.get('text')).toBe('hello');
    expect(params.get('algorithm')).toBeNull();
  });

  test('returns empty params when text is empty', () => {
    const params = buildHashParams('', 'SHA-256');
    expect(params.toString()).toBe('');
  });

  test('skips whitespace-only text', () => {
    const params = buildHashParams('   ', 'SHA-256');
    expect(params.get('text')).toBeNull();
  });
});

describe('buildHashStateFromSearch', () => {
  test('returns defaults for empty search', () => {
    expect(buildHashStateFromSearch({})).toEqual({
      algorithm: 'SHA-256',
      expected: '',
      text: '',
    });
  });

  test('returns provided text with default algorithm', () => {
    expect(buildHashStateFromSearch({ text: 'abc' })).toEqual({
      algorithm: 'SHA-256',
      expected: '',
      text: 'abc',
    });
  });

  test('returns provided algorithm and text', () => {
    expect(
      buildHashStateFromSearch({ algorithm: 'SHA-1', text: 'abc' })
    ).toEqual({
      algorithm: 'SHA-1',
      expected: '',
      text: 'abc',
    });
  });

  test('falls back to SHA-256 for an invalid algorithm', () => {
    expect(buildHashStateFromSearch({ algorithm: 'MD5', text: 'x' })).toEqual({
      algorithm: 'SHA-256',
      expected: '',
      text: 'x',
    });
  });

  test('returns expected hash from search', () => {
    expect(
      buildHashStateFromSearch({
        algorithm: 'SHA-256',
        expected: 'def',
        text: 'abc',
      })
    ).toEqual({
      algorithm: 'SHA-256',
      expected: 'def',
      text: 'abc',
    });
  });
});

describe('buildHashParams with expected', () => {
  test('sets expected when provided', () => {
    const params = buildHashParams('hello', 'SHA-256', 'abc123');
    expect(params.get('expected')).toBe('abc123');
  });

  test('omits expected when empty', () => {
    const params = buildHashParams('hello', 'SHA-256', '');
    expect(params.get('expected')).toBeNull();
  });

  test('omits whitespace-only expected', () => {
    const params = buildHashParams('hello', 'SHA-256', '   ');
    expect(params.get('expected')).toBeNull();
  });
});
