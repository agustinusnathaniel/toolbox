import { describe, expect, test } from 'vite-plus/test';

import { buildJwtParams, buildJwtStateFromSearch } from './jwt-params';

describe('buildJwtParams', () => {
  test('sets token when provided', () => {
    const params = buildJwtParams('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.x');
    expect(params.get('token')).toBe('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.x');
  });

  test('returns empty params when token is empty', () => {
    const params = buildJwtParams('');
    expect(params.toString()).toBe('');
  });

  test('skips whitespace-only token', () => {
    const params = buildJwtParams('   ');
    expect(params.get('token')).toBeNull();
  });

  test('omits token when missing', () => {
    const params = buildJwtParams('');
    expect(params.get('token')).toBeNull();
  });
});

describe('buildJwtStateFromSearch', () => {
  test('returns empty string for empty search', () => {
    expect(buildJwtStateFromSearch({})).toBe('');
  });

  test('returns provided token', () => {
    expect(buildJwtStateFromSearch({ token: 'abc.def.ghi' })).toBe(
      'abc.def.ghi'
    );
  });

  test('returns empty string when token missing', () => {
    expect(buildJwtStateFromSearch({})).toBe('');
  });
});
