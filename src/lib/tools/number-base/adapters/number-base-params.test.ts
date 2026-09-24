import { describe, expect, test } from 'vite-plus/test';

import {
  buildNumberBaseParams,
  buildNumberBaseStateFromSearch,
} from './number-base-params';

describe('buildNumberBaseParams', () => {
  test('omits default base 10', () => {
    const p = buildNumberBaseParams('255', 10);
    expect(p.get('input')).toBe('255');
    expect(p.get('from')).toBeNull();
  });

  test('includes non-default base', () => {
    const p = buildNumberBaseParams('FF', 16);
    expect(p.get('input')).toBe('FF');
    expect(p.get('from')).toBe('16');
  });

  test('omits empty input', () => {
    const p = buildNumberBaseParams('   ', 10);
    expect(p.get('input')).toBeNull();
  });

  test('includes from for non-default base even with empty input', () => {
    const p = buildNumberBaseParams('', 16);
    expect(p.get('input')).toBeNull();
    expect(p.get('from')).toBe('16');
  });
});

describe('buildNumberBaseStateFromSearch', () => {
  test('defaults to 10 and empty input', () => {
    const s = buildNumberBaseStateFromSearch({});
    expect(s.fromBase).toBe(10);
    expect(s.input).toBe('');
  });

  test('parses valid', () => {
    const s = buildNumberBaseStateFromSearch({ from: '16', input: 'FF' });
    expect(s.input).toBe('FF');
    expect(s.fromBase).toBe(16);
  });

  test('falls back on invalid base', () => {
    const s = buildNumberBaseStateFromSearch({ from: '99' });
    expect(s.fromBase).toBe(10);
  });

  test('handles binary base', () => {
    const s = buildNumberBaseStateFromSearch({ from: '2', input: '1010' });
    expect(s.fromBase).toBe(2);
    expect(s.input).toBe('1010');
  });

  test('round-trips octal shared state', () => {
    const params = buildNumberBaseParams('377', 8);
    const search: Record<string, unknown> = {};
    for (const [key, value] of params.entries()) {
      search[key] = value;
    }

    expect(buildNumberBaseStateFromSearch(search)).toEqual({
      fromBase: 8,
      input: '377',
    });
  });
});
