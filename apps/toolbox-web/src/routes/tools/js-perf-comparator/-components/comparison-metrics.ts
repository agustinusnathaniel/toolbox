import type { ExecutionResult } from '@toolbox/js-perf-comp-core';

export type ComparisonVerdict = 'inconclusive' | 'likely' | 'confident';

interface ConfidenceInterval {
  highMs: number;
  lowMs: number;
}

export interface ComparisonMetrics {
  absoluteDeltaMs: number;
  aInterval: ConfidenceInterval | null;
  bInterval: ConfidenceInterval | null;
  combinedMarginMs: number;
  confidenceText: string;
  intervalsOverlap: boolean | null;
  marginRatio: number | null;
  percentDelta: number;
  relativeMarginA: number | null;
  relativeMarginB: number | null;
  speedup: number;
  verdict: ComparisonVerdict;
  winner: 'A' | 'B';
}

function getRelativeMargin(result: ExecutionResult): number | null {
  const meanMs = result.statistics?.meanMs;
  const marginMs = result.statistics?.marginMs;
  if (meanMs === undefined || marginMs === undefined || meanMs <= 0) {
    return null;
  }
  return (marginMs / meanMs) * 100;
}

function getInterval(result: ExecutionResult): ConfidenceInterval | null {
  const meanMs = result.statistics?.meanMs;
  const marginMs = result.statistics?.marginMs;

  if (meanMs === undefined || marginMs === undefined) {
    return null;
  }

  return {
    lowMs: Math.max(0, meanMs - marginMs),
    highMs: Math.max(0, meanMs + marginMs),
  };
}

function detectOverlap(
  intervalA: ConfidenceInterval,
  intervalB: ConfidenceInterval
): boolean {
  return (
    intervalA.lowMs <= intervalB.highMs && intervalB.lowMs <= intervalA.highMs
  );
}

function buildVerdict(
  absoluteDeltaMs: number,
  combinedMarginMs: number
): ComparisonVerdict {
  if (combinedMarginMs <= 0) {
    return absoluteDeltaMs === 0 ? 'inconclusive' : 'confident';
  }

  const ratio = absoluteDeltaMs / combinedMarginMs;
  if (ratio <= 1) {
    return 'inconclusive';
  }
  if (ratio <= 1.5) {
    return 'likely';
  }
  return 'confident';
}

function buildConfidenceText(
  verdict: ComparisonVerdict,
  intervalsOverlap: boolean | null
): string {
  let base = '';
  if (verdict === 'inconclusive') {
    base = 'Difference is within the estimated uncertainty band.';
  } else if (verdict === 'likely') {
    base = 'Difference is slightly above the estimated uncertainty band.';
  } else {
    base = 'Difference is meaningfully above the estimated uncertainty band.';
  }

  if (intervalsOverlap === null) {
    return `${base} Confidence-interval overlap is unavailable for one or both snippets.`;
  }

  return intervalsOverlap
    ? `${base} 95% intervals overlap, so treat close wins with caution.`
    : `${base} 95% intervals do not overlap, which supports the current winner.`;
}

export function buildComparisonMetrics(
  resultA: ExecutionResult,
  resultB: ExecutionResult
): ComparisonMetrics | null {
  if (resultA.status !== 'success' || resultB.status !== 'success') {
    return null;
  }

  const aPerIter = resultA.perIterationMs;
  const bPerIter = resultB.perIterationMs;
  if (aPerIter === null || bPerIter === null) {
    return null;
  }

  const winner = aPerIter <= bPerIter ? 'A' : 'B';
  const faster = winner === 'A' ? aPerIter : bPerIter;
  const slower = winner === 'A' ? bPerIter : aPerIter;

  const absoluteDeltaMs = slower - faster;
  const percentDelta = slower > 0 ? (absoluteDeltaMs / slower) * 100 : 0;
  const speedup = faster > 0 ? slower / faster : 0;

  const combinedMarginMs =
    (resultA.statistics?.marginMs ?? 0) + (resultB.statistics?.marginMs ?? 0);
  const marginRatio =
    combinedMarginMs > 0 ? absoluteDeltaMs / combinedMarginMs : null;

  const aInterval = getInterval(resultA);
  const bInterval = getInterval(resultB);
  const intervalsOverlap =
    aInterval && bInterval ? detectOverlap(aInterval, bInterval) : null;

  const verdict = buildVerdict(absoluteDeltaMs, combinedMarginMs);

  return {
    winner,
    speedup,
    absoluteDeltaMs,
    percentDelta,
    combinedMarginMs,
    marginRatio,
    verdict,
    confidenceText: buildConfidenceText(verdict, intervalsOverlap),
    aInterval,
    bInterval,
    intervalsOverlap,
    relativeMarginA: getRelativeMargin(resultA),
    relativeMarginB: getRelativeMargin(resultB),
  };
}
