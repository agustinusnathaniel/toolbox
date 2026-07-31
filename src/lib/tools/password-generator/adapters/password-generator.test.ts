import { describe, expect, test } from 'vite-plus/test';

import {
  estimateEntropy,
  generatePassword,
  strengthLabel,
} from './password-generator';

const HAS_LOWERCASE = /[a-z]/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_DIGIT = /[0-9]/;
const HAS_SYMBOL = /[^a-zA-Z0-9]/;
const LOWERCASE_ONLY = /^[a-z]+$/;
const HAS_AMBIGUOUS = /[Il1O0o]/;

const ALL_SETS = {
  digits: true,
  excludeAmbiguous: false,
  length: 20,
  lowercase: true,
  symbols: true,
  uppercase: true,
} as const;

describe('generatePassword', () => {
  test('generates a password with the requested length', () => {
    const result = generatePassword(ALL_SETS);
    expect(result.isValid).toBe(true);
    expect(result.output).toHaveLength(20);
  });

  test('includes at least one character from each selected set', () => {
    const result = generatePassword(ALL_SETS);
    expect(result.output).toMatch(HAS_LOWERCASE);
    expect(result.output).toMatch(HAS_UPPERCASE);
    expect(result.output).toMatch(HAS_DIGIT);
    expect(result.output).toMatch(HAS_SYMBOL);
  });

  test('lowercase-only password contains no other character classes', () => {
    const result = generatePassword({
      digits: false,
      excludeAmbiguous: false,
      length: 16,
      lowercase: true,
      symbols: false,
      uppercase: false,
    });
    expect(result.isValid).toBe(true);
    expect(result.output).toMatch(LOWERCASE_ONLY);
  });

  test('respects excludeAmbiguous', () => {
    const result = generatePassword({
      digits: true,
      excludeAmbiguous: true,
      length: 32,
      lowercase: true,
      symbols: true,
      uppercase: true,
    });
    expect(result.output).not.toMatch(HAS_AMBIGUOUS);
  });

  test('rejects length below 8', () => {
    const result = generatePassword({ ...ALL_SETS, length: 7 });
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('rejects length above 128', () => {
    const result = generatePassword({ ...ALL_SETS, length: 129 });
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('rejects no selected character sets', () => {
    const result = generatePassword({
      digits: false,
      excludeAmbiguous: false,
      length: 20,
      lowercase: false,
      symbols: false,
      uppercase: false,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Select at least one character set');
  });

  test('produces different outputs across calls', () => {
    const a = generatePassword(ALL_SETS).output;
    const b = generatePassword(ALL_SETS).output;
    expect(a).not.toBe(b);
  });
});

describe('estimateEntropy', () => {
  test('computes bits for a single set', () => {
    const entropy = estimateEntropy({
      digits: false,
      excludeAmbiguous: false,
      length: 8,
      lowercase: true,
      symbols: false,
      uppercase: false,
    });
    expect(entropy).toBe(37.6);
  });

  test('returns 0 when no sets are selected', () => {
    const entropy = estimateEntropy({
      digits: false,
      excludeAmbiguous: false,
      length: 20,
      lowercase: false,
      symbols: false,
      uppercase: false,
    });
    expect(entropy).toBe(0);
  });

  test('grows with length', () => {
    const short = estimateEntropy({ ...ALL_SETS, length: 12 });
    const long = estimateEntropy({ ...ALL_SETS, length: 24 });
    expect(long).toBeGreaterThan(short);
  });

  test('shrinks when excluding ambiguous characters', () => {
    const withAmbiguous = estimateEntropy({
      ...ALL_SETS,
      excludeAmbiguous: false,
    });
    const withoutAmbiguous = estimateEntropy({
      ...ALL_SETS,
      excludeAmbiguous: true,
    });
    expect(withoutAmbiguous).toBeLessThan(withAmbiguous);
  });
});

describe('strengthLabel', () => {
  test('labels weak entropy', () => {
    expect(strengthLabel(30)).toBe('Weak');
  });

  test('labels good entropy', () => {
    expect(strengthLabel(60)).toBe('Good');
  });

  test('labels strong entropy', () => {
    expect(strengthLabel(80)).toBe('Strong');
  });

  test('labels very strong entropy', () => {
    expect(strengthLabel(120)).toBe('Very strong');
  });
});
