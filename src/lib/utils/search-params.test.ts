import { describe, expect, test } from 'vite-plus/test';
import { z } from 'zod';

import {
  coerceEnum,
  parseIntClamped,
  parseSearchParams,
  readFlag,
  readString,
  stringifySearchParams,
  writeFlag,
} from './search-params';

const uuidSearchSchema = z.object({
  count: z.string().optional(),
  hyphens: z.string().optional(),
  uppercase: z.string().optional(),
  version: z.string().optional(),
});

const singleStringSchema = z.object({
  input: z.string().optional(),
});

const textDiffSchema = z.object({
  modified: z.string().optional(),
  original: z.string().optional(),
});

const LEADING_QUESTION_MARK = /^\?/;

describe('parseSearchParams', () => {
  test('preserves numeric-looking values as strings (no JSON coercion)', () => {
    expect(
      parseSearchParams('count=3&uppercase=1&hyphens=0&version=v7')
    ).toEqual({
      count: '3',
      hyphens: '0',
      uppercase: '1',
      version: 'v7',
    });
  });

  test('keeps plain string values and decodes percent-encoding', () => {
    expect(parseSearchParams('input=hello%20world&mode=encode')).toEqual({
      input: 'hello world',
      mode: 'encode',
    });
  });

  test('uuid-generator share link passes its route schema', () => {
    const parsed = parseSearchParams('count=3&uppercase=1&version=v7');
    const result = uuidSearchSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });

  test('numeric-looking single values pass string schemas', () => {
    const parsed = parseSearchParams('input=123');
    const result = singleStringSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });

  test('text-diff share link passes its route schema', () => {
    const parsed = parseSearchParams('original=123&modified=456');
    const result = textDiffSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });

  test('handles empty and absent search', () => {
    expect(parseSearchParams('')).toEqual({});
    expect(parseSearchParams('?')).toEqual({});
  });
});

describe('stringifySearchParams', () => {
  test('emits string values raw without JSON quotes', () => {
    expect(
      stringifySearchParams({ count: '3', uppercase: '1', version: 'v7' })
    ).toBe('?count=3&uppercase=1&version=v7');
  });

  test('drops undefined values and emits empty string for empty search', () => {
    expect(stringifySearchParams({ count: '3', hyphens: undefined })).toBe(
      '?count=3'
    );
    expect(stringifySearchParams({})).toBe('');
  });

  test('round-trips through parseSearchParams', () => {
    const original = { count: '3', uppercase: '1', version: 'v7' };
    const reparsed = parseSearchParams(
      stringifySearchParams(original).replace(LEADING_QUESTION_MARK, '')
    );
    expect(reparsed).toEqual(original);
  });

  test('serializes non-string values as JSON (symmetric for coerce routes)', () => {
    expect(stringifySearchParams({ rate: 0.5 })).toBe('?rate=0.5');
    expect(parseSearchParams('rate=0.5')).toEqual({ rate: '0.5' });
  });
});

describe('coerceEnum', () => {
  const allowed = new Set(['a', 'b'] as const);

  test('returns an allowed value', () => {
    expect(coerceEnum('a', allowed, 'b')).toBe('a');
  });

  test('falls back for a disallowed value', () => {
    expect(coerceEnum('c', allowed, 'b')).toBe('b');
  });

  test('falls back for non-string values', () => {
    expect(coerceEnum(1, allowed, 'b')).toBe('b');
    expect(coerceEnum(undefined, allowed, 'b')).toBe('b');
  });
});

describe('parseIntClamped', () => {
  test('parses in-range integers', () => {
    expect(parseIntClamped('5', 1, 10, 3)).toBe(5);
  });

  test('clamps below the minimum', () => {
    expect(parseIntClamped('-5', 1, 10, 3)).toBe(1);
  });

  test('clamps above the maximum', () => {
    expect(parseIntClamped('99', 1, 10, 3)).toBe(10);
  });

  test('falls back for missing or non-numeric values', () => {
    expect(parseIntClamped(undefined, 1, 10, 3)).toBe(3);
    expect(parseIntClamped('abc', 1, 10, 3)).toBe(3);
    expect(parseIntClamped('', 1, 10, 3)).toBe(3);
  });
});

describe('readFlag / writeFlag', () => {
  test('round-trips 1 and 0', () => {
    expect(readFlag(writeFlag(true), false)).toBe(true);
    expect(readFlag(writeFlag(false), true)).toBe(false);
  });

  test('falls back for missing or unknown values', () => {
    expect(readFlag(undefined, true)).toBe(true);
    expect(readFlag('yes', false)).toBe(false);
  });
});

describe('readString', () => {
  test('returns string values unchanged', () => {
    expect(readString('hello')).toBe('hello');
    expect(readString('')).toBe('');
  });

  test('falls back for non-string values', () => {
    expect(readString(123)).toBe('');
    expect(readString(undefined, 'fallback')).toBe('fallback');
    expect(readString(null, 'fallback')).toBe('fallback');
  });
});
