import { describe, expect, test } from 'vite-plus/test';

import { buildColorParams, buildColorStateFromSearch } from './color-params';

describe('buildColorParams', () => {
  test('sets c when input is non-empty', () => {
    const params = buildColorParams('#ff0000');
    expect(params.get('c')).toBe('#ff0000');
  });

  test('returns empty params when input is blank', () => {
    const params = buildColorParams('');
    expect(params.has('c')).toBe(false);
  });

  test('returns empty params for whitespace-only input', () => {
    const params = buildColorParams('   ');
    expect(params.has('c')).toBe(false);
  });

  test('encodes special characters', () => {
    const params = buildColorParams('rgb(255, 0, 0)');
    expect(params.get('c')).toBe('rgb(255, 0, 0)');
    expect(params.toString()).toBe('c=rgb%28255%2C+0%2C+0%29');
  });
});

describe('buildColorStateFromSearch', () => {
  test('returns the c value', () => {
    expect(buildColorStateFromSearch({ c: '#00ff00' })).toBe('#00ff00');
  });

  test('returns empty string when c is absent', () => {
    expect(buildColorStateFromSearch({})).toBe('');
  });
});
