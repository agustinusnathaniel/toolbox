import { describe, expect, test } from 'vite-plus/test';

import { buildUaParams, buildUaStateFromSearch } from './ua-params';

describe('buildUaParams', () => {
  test('includes the UA string', () => {
    const params = buildUaParams(
      'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0'
    );
    expect(params.get('ua')).toBe(
      'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0'
    );
  });

  test('omits empty input', () => {
    const params = buildUaParams('');
    expect(params.has('ua')).toBe(false);
  });

  test('omits whitespace-only input', () => {
    const params = buildUaParams('   ');
    expect(params.has('ua')).toBe(false);
  });
});

describe('buildUaStateFromSearch', () => {
  test('returns empty string for empty search', () => {
    expect(buildUaStateFromSearch({})).toBe('');
  });

  test('returns ua from search', () => {
    expect(buildUaStateFromSearch({ ua: 'Firefox/121.0' })).toBe(
      'Firefox/121.0'
    );
  });
});
