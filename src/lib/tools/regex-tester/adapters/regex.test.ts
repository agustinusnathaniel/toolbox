import { describe, expect, test } from 'vite-plus/test';

import { testRegex } from './regex';

describe('testRegex', () => {
  test('returns valid empty result for empty pattern', () => {
    const result = testRegex('', '', 'hello');
    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(0);
    expect(result.matches).toEqual([]);
  });

  test('finds a single literal match with its index', () => {
    const result = testRegex('cat', '', 'the cat sat');
    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(1);
    expect(result.matches).toEqual([{ full: 'cat', groups: [], index: 4 }]);
  });

  test('finds all matches without the g flag', () => {
    const result = testRegex('cat', '', 'cat cat');
    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(2);
    expect(result.matches.map((m) => m.index)).toEqual([0, 4]);
  });

  test('finds all matches with the g flag', () => {
    const result = testRegex('cat', 'g', 'cat cat');
    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(2);
    expect(result.matches.map((m) => m.index)).toEqual([0, 4]);
  });

  test('captures groups in order', () => {
    const result = testRegex('(\\w+)@(\\w+)', '', 'a@b');
    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(1);
    expect(result.matches[0].groups).toEqual(['a', 'b']);
  });

  test('reports unmatched optional groups as undefined', () => {
    const result = testRegex('(a)?b', '', 'b');
    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(1);
    expect(result.matches[0].groups).toEqual([undefined]);
  });

  test('returns an error for an invalid pattern', () => {
    const result = testRegex('(', '', 'x');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.length).toBeGreaterThan(0);
    expect(result.matchCount).toBe(0);
    expect(result.matches).toEqual([]);
  });

  test('returns valid empty result when nothing matches', () => {
    const result = testRegex('zzz', '', 'abc');
    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(0);
    expect(result.matches).toEqual([]);
  });

  test('honors the case-insensitive flag', () => {
    const result = testRegex('CAT', 'i', 'cat');
    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(1);
    expect(result.matches[0].full).toBe('cat');
  });

  test('handles zero-length matches without hanging', () => {
    const result = testRegex('a*', '', 'bbb');
    expect(result.isValid).toBe(true);
    expect(result.matches.length).toBeGreaterThanOrEqual(1);
  });

  test('handles zero-length matches everywhere without hanging', () => {
    const result = testRegex('x*', '', 'abc');
    expect(result.isValid).toBe(true);
    expect(result.matches.length).toBeGreaterThanOrEqual(1);
  });

  test('supports multiline matching with the m flag', () => {
    const result = testRegex('^b', 'm', 'a\nb');
    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(1);
    expect(result.matches[0].index).toBe(2);
  });
});
