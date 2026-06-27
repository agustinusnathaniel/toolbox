import { describe, expect, test } from 'vite-plus/test';

import { buildComparisonMetrics } from './metrics';
import type { ExecutionResult } from './models';

function makeExecResult(overrides: Partial<ExecutionResult>): ExecutionResult {
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

function simpleResult(
  perIterationMs: number,
  meanMs?: number,
  marginMs?: number
): ExecutionResult {
  return makeExecResult({
    status: 'success',
    perIterationMs,
    statistics:
      meanMs === undefined
        ? null
        : {
            iterations: 10,
            maxMs: perIterationMs * 1.5,
            meanMs,
            minMs: perIterationMs * 0.5,
            marginMs: marginMs ?? 0,
            stddevMs: marginMs === undefined ? 0 : marginMs / 2,
          },
  });
}

describe('buildComparisonMetrics', () => {
  test('returns ComparisonMetrics when both results succeed', () => {
    const result = buildComparisonMetrics(
      simpleResult(10, 10, 1),
      simpleResult(20, 20, 2)
    );

    expect(result?.winner).toBe('A');
    expect(result?.speedup).toBe(2);
    expect(result?.absoluteDeltaMs).toBe(10);
    expect(result?.percentDelta).toBeCloseTo(50, 4);
  });

  test('returns null when result A is not success', () => {
    const result = buildComparisonMetrics(
      makeExecResult({ status: 'runtime_error', durationMs: null }),
      simpleResult(10)
    );
    expect(result).toBeNull();
  });

  test('returns null when result B is not success', () => {
    const result = buildComparisonMetrics(
      simpleResult(10),
      makeExecResult({ status: 'timeout', durationMs: null })
    );
    expect(result).toBeNull();
  });

  test('returns null when perIterationMs is null on either result', () => {
    const result = buildComparisonMetrics(
      makeExecResult({ status: 'success', perIterationMs: 10 }),
      makeExecResult({ status: 'success', perIterationMs: null })
    );
    expect(result).toBeNull();
  });

  test('A-faster case: winner A, speedup > 1, positive delta', () => {
    const result = buildComparisonMetrics(
      simpleResult(5, 5, 1),
      simpleResult(15, 15, 1)
    );

    expect(result?.winner).toBe('A');
    expect(result?.speedup).toBeCloseTo(3, 4);
    expect(result?.absoluteDeltaMs).toBeCloseTo(10, 4);
    expect(result?.percentDelta).toBeCloseTo(66.6667, 2);
  });

  test('B-faster case: winner B, speedup > 1', () => {
    const result = buildComparisonMetrics(
      simpleResult(20, 20, 1),
      simpleResult(5, 5, 1)
    );

    expect(result?.winner).toBe('B');
    expect(result?.speedup).toBeCloseTo(4, 4);
    expect(result?.absoluteDeltaMs).toBeCloseTo(15, 4);
  });

  test('tie (equal perIterationMs) -> winner A (due to <=), speedup 1', () => {
    const result = buildComparisonMetrics(
      simpleResult(10, 10, 0),
      simpleResult(10, 10, 0)
    );

    expect(result?.winner).toBe('A');
    expect(result?.speedup).toBe(1);
    expect(result?.absoluteDeltaMs).toBe(0);
    expect(result?.percentDelta).toBe(0);
    expect(result?.marginRatio).toBeNull();
  });

  test('verdict inconclusive when delta within combined margin', () => {
    const result = buildComparisonMetrics(
      simpleResult(10, 10, 2),
      simpleResult(12, 12, 1)
    );

    expect(result?.verdict).toBe('inconclusive');
    expect(result?.winner).toBe('A');
  });

  test('verdict likely when delta between 1x and 1.5x combined margin', () => {
    const result = buildComparisonMetrics(
      simpleResult(10, 10, 2),
      simpleResult(15, 15, 2)
    );

    expect(result?.verdict).toBe('likely');
  });

  test('verdict confident when delta > 1.5x combined margin', () => {
    const result = buildComparisonMetrics(
      simpleResult(10, 10, 2),
      simpleResult(20, 20, 3)
    );

    expect(result?.verdict).toBe('confident');
  });

  test('intervals overlap when confidence intervals intersect', () => {
    const result = buildComparisonMetrics(
      simpleResult(10, 10, 2),
      simpleResult(12, 12, 2)
    );

    expect(result?.intervalsOverlap).toBe(true);
    expect(result?.aInterval).toStrictEqual({ lowMs: 8, highMs: 12 });
    expect(result?.bInterval).toStrictEqual({ lowMs: 10, highMs: 14 });
  });

  test('intervals do not overlap when confidence intervals are separate', () => {
    const result = buildComparisonMetrics(
      simpleResult(10, 10, 1),
      simpleResult(15, 15, 1)
    );

    expect(result?.intervalsOverlap).toBe(false);
  });

  test('null relative margins and intervals when statistics missing', () => {
    const result = buildComparisonMetrics(
      makeExecResult({
        status: 'success',
        perIterationMs: 10,
        statistics: null,
      }),
      simpleResult(20, 20, 5)
    );

    expect(result?.relativeMarginA).toBeNull();
    expect(result?.relativeMarginB).toBeCloseTo(25, 4);
    expect(result?.aInterval).toBeNull();
    expect(result?.bInterval).toStrictEqual({ lowMs: 15, highMs: 25 });
    expect(result?.intervalsOverlap).toBeNull();
  });
});

describe('buildConfidenceText scenarios', () => {
  test('inconclusive verdict with overlapping intervals', () => {
    const result = buildComparisonMetrics(
      simpleResult(10, 10, 2),
      simpleResult(12, 12, 2.5)
    );

    expect(result?.verdict).toBe('inconclusive');
    expect(result?.confidenceText).toBe(
      'Difference is within the estimated uncertainty band. 95% intervals overlap, so treat close wins with caution.'
    );
  });

  test('likely verdict with non-overlapping intervals', () => {
    const result = buildComparisonMetrics(
      simpleResult(10, 10, 1),
      simpleResult(13, 13, 1)
    );

    expect(result?.verdict).toBe('likely');
    expect(result?.confidenceText).toBe(
      'Difference is slightly above the estimated uncertainty band. 95% intervals do not overlap, which supports the current winner.'
    );
  });

  test('confident verdict with null interval overlap', () => {
    const result = buildComparisonMetrics(
      makeExecResult({
        status: 'success',
        perIterationMs: 10,
        statistics: null,
      }),
      simpleResult(20, 20, 1)
    );

    expect(result?.verdict).toBe('confident');
    expect(result?.confidenceText).toBe(
      'Difference is meaningfully above the estimated uncertainty band. Confidence-interval overlap is unavailable for one or both snippets.'
    );
  });
});
