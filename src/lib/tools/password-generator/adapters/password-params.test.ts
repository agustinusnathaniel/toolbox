import { describe, expect, test } from 'vite-plus/test';

import type { PasswordOptions } from './password-generator';
import {
  buildPasswordParams,
  buildPasswordStateFromSearch,
} from './password-params';

const ALL_OPTIONS: PasswordOptions = {
  digits: true,
  excludeAmbiguous: false,
  length: 20,
  lowercase: true,
  symbols: false,
  uppercase: true,
};

const NON_DEFAULT_OPTIONS: PasswordOptions = {
  digits: false,
  excludeAmbiguous: true,
  length: 32,
  lowercase: false,
  symbols: true,
  uppercase: false,
};

describe('buildPasswordParams', () => {
  test('returns empty params for default options', () => {
    const params = buildPasswordParams(ALL_OPTIONS);
    expect(params.toString()).toBe('');
  });

  test('encodes non-default length', () => {
    const params = buildPasswordParams({ ...ALL_OPTIONS, length: 32 });
    expect(params.get('length')).toBe('32');
  });

  test('encodes non-default booleans as 1/0', () => {
    const params = buildPasswordParams({
      ...ALL_OPTIONS,
      excludeAmbiguous: true,
      symbols: true,
    });
    expect(params.get('symbols')).toBe('1');
    expect(params.get('excludeAmbiguous')).toBe('1');
    expect(params.get('lowercase')).toBeNull();
  });

  test('encodes disabled defaults as 0', () => {
    const params = buildPasswordParams({
      ...ALL_OPTIONS,
      lowercase: false,
      uppercase: false,
    });
    expect(params.get('lowercase')).toBe('0');
    expect(params.get('uppercase')).toBe('0');
  });
});

describe('buildPasswordStateFromSearch', () => {
  test('returns defaults for empty search', () => {
    const state = buildPasswordStateFromSearch({});
    expect(state).toEqual(ALL_OPTIONS);
  });

  test('parses length from string', () => {
    const state = buildPasswordStateFromSearch({ length: '32' });
    expect(state.length).toBe(32);
  });

  test('ignores invalid length', () => {
    expect(buildPasswordStateFromSearch({ length: 'abc' }).length).toBe(20);
    expect(buildPasswordStateFromSearch({ length: '3' }).length).toBe(20);
    expect(buildPasswordStateFromSearch({ length: '200' }).length).toBe(20);
  });

  test('parses boolean flags', () => {
    const state = buildPasswordStateFromSearch({
      excludeAmbiguous: '1',
      lowercase: '0',
      symbols: '1',
      uppercase: '0',
    });
    expect(state.excludeAmbiguous).toBe(true);
    expect(state.symbols).toBe(true);
    expect(state.lowercase).toBe(false);
    expect(state.uppercase).toBe(false);
  });

  test('roundtrips through buildParams', () => {
    const params = buildPasswordParams(NON_DEFAULT_OPTIONS);
    const search: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      search[key] = value;
    }
    const restored = buildPasswordStateFromSearch(search);
    expect(restored).toEqual(NON_DEFAULT_OPTIONS);
  });
});
