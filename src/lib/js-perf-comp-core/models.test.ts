import { describe, expect, test } from 'vite-plus/test';

import type { ExecutionResult, ExecutionStatistics } from './models';
import {
  buildStabilitySummaryResult,
  calculateRobustStatistics,
  createWorkerErrorResult,
  formatDuration,
  formatStatistics,
} from './models';

function makeResult(overrides: Partial<ExecutionResult>): ExecutionResult {
  return {
    code: '',
    durationMs: null,
    errorMessage: null,
    id: '',
    output: [],
    perIterationMs: null,
    statistics: null,
    status: 'success',
    ...overrides,
  };
}

describe('calculateRobustStatistics', () => {
  test('empty array returns zeroed stats', () => {
    const r = calculateRobustStatistics([]);
    expect(r.iterations).toBe(0);
    expect(r.minMs).toBe(0);
    expect(r.maxMs).toBe(0);
    expect(r.meanMs).toBe(0);
    expect(r.stddevMs).toBe(0);
    expect(r.marginMs).toBe(0);
  });
  test('single element returns that element', () => {
    const r = calculateRobustStatistics([7]);
    expect(r.iterations).toBe(1);
    expect(r.minMs).toBe(7);
    expect(r.maxMs).toBe(7);
    expect(r.meanMs).toBe(7);
    expect(r.stddevMs).toBe(0);
    expect(r.marginMs).toBe(0);
  });
  test('two identical values yield mean, zero stddev', () => {
    const r = calculateRobustStatistics([3, 3]);
    expect(r.iterations).toBe(2);
    expect(r.meanMs).toBe(3);
    expect(r.stddevMs).toBe(0);
    expect(r.marginMs).toBe(0);
  });
  test('normal distribution returns expected mean and stddev', () => {
    const r = calculateRobustStatistics([2, 4, 4, 6, 8]);
    expect(r.iterations).toBe(5);
    expect(r.minMs).toBe(2);
    expect(r.maxMs).toBe(8);
    expect(r.meanMs).toBeCloseTo(4, 4);
    expect(r.stddevMs).toBeCloseTo(Math.sqrt(4.8), 4);
  });
  test('removes outliers using IQR method', () => {
    const r = calculateRobustStatistics([1, 2, 2, 3, 100]);
    expect(r.iterations).toBe(5);
    expect(r.meanMs).toBe(2);
    expect(r.minMs).toBe(1);
    expect(r.maxMs).toBe(3);
    expect(r.stddevMs).toBeCloseTo(Math.sqrt(0.5), 4);
  });
  test('all same values yield zero stddev and margin', () => {
    const r = calculateRobustStatistics([5, 5, 5, 5]);
    expect(r.iterations).toBe(4);
    expect(r.meanMs).toBe(5);
    expect(r.stddevMs).toBe(0);
    expect(r.marginMs).toBe(0);
  });
  test('handles data where all values fall within IQR bounds', () => {
    const r = calculateRobustStatistics([1, 100, 200]);
    expect(r.iterations).toBe(3);
    expect(r.meanMs).toBe(100);
    expect(r.minMs).toBe(1);
    expect(r.maxMs).toBe(200);
    expect(r.stddevMs).toBeGreaterThan(0);
  });
});

describe('formatDuration', () => {
  test('null returns em dash', () => {
    expect(formatDuration(null)).toBe('\u2014');
  });
  test('sub-millisecond returns microseconds', () => {
    expect(formatDuration(0.5)).toBe('500.00 \u00b5s');
  });
  test('1 ms returns ms string', () => {
    expect(formatDuration(1)).toBe('1.00 ms');
  });
  test('500 ms returns ms string', () => {
    expect(formatDuration(500)).toBe('500.00 ms');
  });
  test('1500 ms returns seconds string', () => {
    expect(formatDuration(1500)).toBe('1.50 s');
  });
});

describe('formatStatistics', () => {
  test('formats statistics display string', () => {
    const s: ExecutionStatistics = {
      iterations: 30,
      maxMs: 15,
      meanMs: 10.5,
      minMs: 5,
      marginMs: 2.3,
      stddevMs: 3,
    };
    expect(formatStatistics(s)).toBe('10.50 ms \u00b12.30 ms (30 runs)');
  });
});

describe('createWorkerErrorResult', () => {
  test('null runEntry returns null', () => {
    expect(createWorkerErrorResult(null, 'error')).toBeNull();
  });
  test('valid runEntry with error message returns error result', () => {
    const r = createWorkerErrorResult(
      { code: 'test-code', id: 'abc-123' },
      'Something broke'
    );
    expect(r?.id).toBe('abc-123');
    expect(r?.code).toBe('test-code');
    expect(r?.status).toBe('worker_error');
    expect(r?.durationMs).toBeNull();
    expect(r?.perIterationMs).toBeNull();
    expect(r?.statistics).toBeNull();
    expect(r?.errorMessage).toBe('Something broke');
    expect(r?.output).toEqual([]);
  });
  test('valid runEntry with null errorMessage uses default', () => {
    const r = createWorkerErrorResult(
      { code: 'test-code', id: 'abc-123' },
      null
    );
    expect(r?.errorMessage).toBe('Worker crashed unexpectedly');
  });
});

describe('buildStabilitySummaryResult', () => {
  test('all rounds successful returns success status', () => {
    const results: Array<ExecutionResult> = [
      makeResult({ status: 'success', perIterationMs: 10 }),
      makeResult({ status: 'success', perIterationMs: 12 }),
      makeResult({ status: 'success', perIterationMs: 11 }),
    ];
    const r = buildStabilitySummaryResult('test-code', 5, 3, results, 'A');
    expect(r.status).toBe('success');
    expect(r.errorMessage).toBeNull();
    expect(r.statistics?.iterations).toBe(3);
    expect(r.perIterationMs).toBeCloseTo(11, 4);
    expect(r.durationMs).toBeCloseTo(55, 4);
    expect(r.id).toBe('a-stability-summary');
    expect(r.output).toContain('Stability mode summary: 3 rounds aggregated.');
  });
  test('mixed success/failure uses first failure', () => {
    const results: Array<ExecutionResult> = [
      makeResult({ status: 'success', perIterationMs: 8 }),
      makeResult({
        status: 'runtime_error',
        perIterationMs: null,
        errorMessage: 'OOM',
      }),
    ];
    const r = buildStabilitySummaryResult('test-code', 5, 2, results, 'B');
    expect(r.status).toBe('runtime_error');
    expect(r.errorMessage).toContain('1/2');
    expect(r.errorMessage).toContain('First failure: OOM.');
    expect(r.id).toBe('b-stability-summary');
  });
  test('no rounds returns null statistics', () => {
    const r = buildStabilitySummaryResult('test-code', 5, 0, [], 'A');
    expect(r.status).toBe('success');
    expect(r.statistics).toBeNull();
    expect(r.perIterationMs).toBeNull();
    expect(r.durationMs).toBeNull();
    expect(r.id).toBe('a-stability-summary');
  });
});
