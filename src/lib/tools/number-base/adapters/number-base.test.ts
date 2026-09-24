import { describe, expect, test } from 'vite-plus/test';

import { convertNumberBase } from './number-base';

describe('convertNumberBase valid conversions', () => {
  test('empty input', () => {
    const r = convertNumberBase('', 10);
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Input is empty');
  });

  test('decimal 255 converts to all bases', () => {
    const r = convertNumberBase('255', 10);
    expect(r.isValid).toBe(true);
    expect(r.decimal).toBe('255');
    expect(r.binary).toBe('11111111');
    expect(r.octal).toBe('377');
    expect(r.hex).toBe('FF');
  });

  test('binary 11111111 converts to decimal 255', () => {
    const r = convertNumberBase('11111111', 2);
    expect(r.isValid).toBe(true);
    expect(r.decimal).toBe('255');
    expect(r.hex).toBe('FF');
  });

  test('hex FF converts to decimal 255 (case-insensitive, with prefix)', () => {
    const lower = convertNumberBase('ff', 16);
    expect(lower.decimal).toBe('255');
    const prefixed = convertNumberBase('0xFF', 16);
    expect(prefixed.decimal).toBe('255');
    expect(prefixed.hex).toBe('FF');
  });

  test('octal 377 converts to decimal 255', () => {
    const r = convertNumberBase('377', 8);
    expect(r.decimal).toBe('255');
  });
});

describe('convertNumberBase errors and sign handling', () => {
  test('invalid binary returns error', () => {
    const r = convertNumberBase('102', 2);
    expect(r.isValid).toBe(false);
    expect(r.error).toContain('binary');
  });

  test('invalid hex returns error', () => {
    const r = convertNumberBase('GHI', 16);
    expect(r.isValid).toBe(false);
    expect(r.error).toContain('hexadecimal');
  });

  test('negative decimal', () => {
    const r = convertNumberBase('-42', 10);
    expect(r.isValid).toBe(true);
    expect(r.decimal).toBe('-42');
    expect(r.binary).toBe('-101010');
    expect(r.octal).toBe('-52');
    expect(r.hex).toBe('-2A');
  });

  test('zero converts to zero in all bases', () => {
    const r = convertNumberBase('0', 10);
    expect(r.isValid).toBe(true);
    expect(r.binary).toBe('0');
    expect(r.octal).toBe('0');
    expect(r.decimal).toBe('0');
    expect(r.hex).toBe('0');
  });

  test('large number beyond MAX_SAFE_INTEGER', () => {
    const r = convertNumberBase('9007199254740993', 10);
    expect(r.isValid).toBe(true);
    expect(r.decimal).toBe('9007199254740993');
    expect(r.hex).toBe('20000000000001');
  });
});

describe('convertNumberBase prefixes and length limits', () => {
  test('binary with 0b prefix', () => {
    const r = convertNumberBase('0b1010', 2);
    expect(r.isValid).toBe(true);
    expect(r.decimal).toBe('10');
  });

  test('negative hex', () => {
    const r = convertNumberBase('-FF', 16);
    expect(r.isValid).toBe(true);
    expect(r.decimal).toBe('-255');
  });

  test('rejects input longer than 500 digits', () => {
    const r = convertNumberBase('1'.repeat(501), 10);
    expect(r.isValid).toBe(false);
    expect(r.error).toContain('Input too long');
  });

  test('allows 500 digits boundary', () => {
    const r = convertNumberBase('1'.repeat(500), 10);
    expect(r.isValid).toBe(true);
    expect(r.decimal).toBe('1'.repeat(500));
  });
});
