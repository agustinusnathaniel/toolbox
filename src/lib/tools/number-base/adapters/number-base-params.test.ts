import { describe, expect, test } from 'vitest';

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

  test('omits from when 10 even with input', () => {
    const p = buildNumberBaseParams('', 16);
    expect(p.get('input')).toBeNull();
    expect(p.get('from')).toBe('16');
  });

  test('encodes both', () => {
    const p = buildNumberBaseParams('1010', 2);
    expect(p.toString()).toBe('input=1010&from=2');
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
});
