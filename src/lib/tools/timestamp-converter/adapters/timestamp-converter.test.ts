import { describe, expect, test } from 'vite-plus/test';

import { convertTimestamp } from './timestamp-converter';

describe('convertTimestamp', () => {
  test('returns invalid result for empty input', () => {
    const result = convertTimestamp('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('converts 10-digit epoch seconds', () => {
    const result = convertTimestamp('1700000000');
    expect(result.isValid).toBe(true);
    expect(result.epochSeconds).toBe('1700000000');
    expect(result.epochMillis).toBe('1700000000000');
    expect(result.iso).toBe('2023-11-14T22:13:20.000Z');
  });

  test('converts 13-digit epoch milliseconds', () => {
    const result = convertTimestamp('1700000000000');
    expect(result.isValid).toBe(true);
    expect(result.epochSeconds).toBe('1700000000');
    expect(result.epochMillis).toBe('1700000000000');
    expect(result.iso).toBe('2023-11-14T22:13:20.000Z');
  });

  test('parses an ISO date string', () => {
    const result = convertTimestamp('2023-11-14T22:13:20.000Z');
    expect(result.isValid).toBe(true);
    expect(result.epochSeconds).toBe('1700000000');
    expect(result.iso).toBe('2023-11-14T22:13:20.000Z');
  });

  test('parses a human-readable date string', () => {
    const result = convertTimestamp('November 14, 2023 22:13:20 UTC');
    expect(result.isValid).toBe(true);
    expect(result.epochSeconds).toBe('1700000000');
  });

  test('reports relative time in the past', () => {
    const now = 1_700_000_000_000;
    const result = convertTimestamp('1699996400000', now); // 1 hour earlier
    expect(result.isValid).toBe(true);
    expect(result.relative).toBe('1 hour ago');
  });

  test('reports relative time in the future', () => {
    const now = 1_700_000_000_000;
    const result = convertTimestamp('1700003600000', now); // 1 hour later
    expect(result.isValid).toBe(true);
    expect(result.relative).toBe('in 1 hour');
  });

  test('rejects garbage input', () => {
    const result = convertTimestamp('not-a-date');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('rejects out-of-range timestamps', () => {
    const result = convertTimestamp('99999999999999999999999999');
    expect(result.isValid).toBe(false);
  });
});
