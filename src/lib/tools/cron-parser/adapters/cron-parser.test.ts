import { describe, expect, test } from 'vite-plus/test';

import { buildCronParams, buildCronStateFromSearch } from './cron-params';
import { CRON_EXAMPLES, parseCronExpression } from './cron-parser';

describe('parseCronExpression', () => {
  test.each([
    ['* * * * *', 'Every minute'],
    ['*/5 * * * *', 'Every 5 minutes'],
    ['0 0 * * *', 'At 12:00 AM'],
  ])('parses %s with a human-readable description', (expression, expected) => {
    const result = parseCronExpression(expression);
    expect(result.isValid).toBe(true);
    expect(result.humanReadable).toBe(expected);
    expect(result.nextRuns).toHaveLength(5);
    for (const run of result.nextRuns ?? []) {
      expect(() => new Date(run).toISOString()).not.toThrow();
    }
  });

  test('respects count option', () => {
    const result = parseCronExpression('0 * * * *', { count: 3 });
    expect(result.isValid).toBe(true);
    expect(result.nextRuns).toHaveLength(3);
  });

  test('computes next runs in the requested timezone', () => {
    const result = parseCronExpression('0 9 * * *', { tz: 'UTC' });
    expect(result.isValid).toBe(true);
    expect(result.nextRuns).toHaveLength(5);
    for (const run of result.nextRuns ?? []) {
      expect(new Date(run).getUTCHours()).toBe(9);
      expect(new Date(run).getUTCMinutes()).toBe(0);
    }
  });

  test('returns error for invalid expression', () => {
    const result = parseCronExpression('invalid');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.length).toBeGreaterThan(0);
    expect(result.nextRuns).toBeUndefined();
  });

  test('returns error for empty expression', () => {
    const result = parseCronExpression('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Enter a cron expression');
  });

  test('returns error for whitespace only', () => {
    const result = parseCronExpression('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Enter a cron expression');
  });

  test('returns error for out-of-range field', () => {
    const result = parseCronExpression('60 * * * *');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('CRON_EXAMPLES contains expected examples', () => {
    expect(CRON_EXAMPLES.length).toBeGreaterThanOrEqual(5);
    for (const example of CRON_EXAMPLES) {
      const result = parseCronExpression(example.expression);
      expect(result.isValid).toBe(true);
    }
  });
});

describe('cron-params roundtrip', () => {
  test('buildCronParams sets expression', () => {
    const params = buildCronParams('0 * * * *');
    expect(params.get('expression')).toBe('0 * * * *');
  });

  test('buildCronParams skips empty', () => {
    const params = buildCronParams('');
    expect(params.toString()).toBe('');
  });

  test('buildCronParams skips whitespace only', () => {
    const params = buildCronParams('   ');
    expect(params.toString()).toBe('');
  });

  test('buildCronStateFromSearch returns defaults', () => {
    const state = buildCronStateFromSearch({});
    expect(state).toEqual({ expression: '' });
  });

  test('buildCronStateFromSearch returns provided', () => {
    const state = buildCronStateFromSearch({ expression: '*/5 * * * *' });
    expect(state).toEqual({ expression: '*/5 * * * *' });
  });

  test('roundtrip preserves expression', () => {
    const expression = '0 9 * * 1';
    const params = buildCronParams(expression);
    const search = Object.fromEntries(params.entries());
    const state = buildCronStateFromSearch(search);
    expect(state.expression).toBe(expression);
  });
});
