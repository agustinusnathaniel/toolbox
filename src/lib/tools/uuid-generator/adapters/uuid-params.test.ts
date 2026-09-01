import { describe, expect, test } from 'vite-plus/test';

import { DEFAULT_UUID_OPTIONS } from './uuid-generator';
import { buildUuidParams, buildUuidStateFromSearch } from './uuid-params';

describe('buildUuidParams', () => {
  test('returns empty params for default options', () => {
    expect(buildUuidParams(DEFAULT_UUID_OPTIONS).toString()).toBe('');
  });

  test('sets all four keys for all non-defaults', () => {
    const params = buildUuidParams({
      count: 5,
      hyphens: false,
      uppercase: true,
      version: 'v7',
    });
    expect(params.get('count')).toBe('5');
    expect(params.get('hyphens')).toBe('0');
    expect(params.get('uppercase')).toBe('1');
    expect(params.get('version')).toBe('v7');
  });
});

describe('buildUuidStateFromSearch', () => {
  test('returns defaults for empty search', () => {
    expect(buildUuidStateFromSearch({})).toEqual(DEFAULT_UUID_OPTIONS);
  });

  test('returns provided values for a valid search', () => {
    expect(
      buildUuidStateFromSearch({
        count: '25',
        hyphens: '0',
        uppercase: '1',
        version: 'v7',
      })
    ).toEqual({
      count: 25,
      hyphens: false,
      uppercase: true,
      version: 'v7',
    });
  });

  test('falls back to defaults for invalid values', () => {
    expect(buildUuidStateFromSearch({ version: 'v9' })).toEqual(
      DEFAULT_UUID_OPTIONS
    );
    expect(buildUuidStateFromSearch({ count: 'abc' })).toEqual(
      DEFAULT_UUID_OPTIONS
    );
    expect(buildUuidStateFromSearch({ count: '0' })).toEqual(
      DEFAULT_UUID_OPTIONS
    );
  });
});
