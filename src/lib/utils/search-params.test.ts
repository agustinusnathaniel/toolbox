import { describe, expect, test } from 'vite-plus/test';
import { z } from 'zod';

import { parseSearchParams, stringifySearchParams } from './search-params';

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
