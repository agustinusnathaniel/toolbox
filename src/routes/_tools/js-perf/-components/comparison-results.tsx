import { Card, CardContent } from '@/lib/components/ui/card';
import {
  buildComparisonMetrics,
  type ComparisonVerdict,
} from '@/lib/js-perf-comp-core/metrics';
import {
  type ExecutionResult,
  formatDuration,
} from '@/lib/js-perf-comp-core/models';

import { ComparisonEntry } from './comparison-entry';
import { ResultCard } from './result-card';
import type { RunState } from './types';

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatVerdict(verdict: ComparisonVerdict): string {
  switch (verdict) {
    case 'inconclusive':
      return 'Inconclusive';
    case 'likely':
      return 'Likely winner';
    case 'confident':
      return 'Confident winner';
    default:
      return 'Inconclusive';
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/20 px-2 py-1.5">
      <span className="text-muted-fg">{label}</span>
      <span className="font-medium text-fg">{value}</span>
    </div>
  );
}

function ComparisonInsights({
  resultA,
  resultB,
}: {
  resultA: ExecutionResult;
  resultB: ExecutionResult;
}) {
  const metrics = buildComparisonMetrics(resultA, resultB);
  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-2">
          <span className="font-medium text-sm">Comparison Insights</span>
          <p className="text-muted-fg text-sm">
            Insights require both snippets to complete successfully.
          </p>
        </CardContent>
      </Card>
    );
  }

  const verdict = formatVerdict(metrics.verdict);
  const aIntervalText = metrics.aInterval
    ? `${formatDuration(metrics.aInterval.lowMs)} - ${formatDuration(metrics.aInterval.highMs)}`
    : 'Unavailable';
  const bIntervalText = metrics.bInterval
    ? `${formatDuration(metrics.bInterval.lowMs)} - ${formatDuration(metrics.bInterval.highMs)}`
    : 'Unavailable';
  let overlapText = 'Unavailable';
  if (metrics.intervalsOverlap === true) {
    overlapText = 'Yes';
  } else if (metrics.intervalsOverlap === false) {
    overlapText = 'No';
  }
  const marginRatioText =
    metrics.marginRatio === null
      ? 'Unavailable'
      : `${metrics.marginRatio.toFixed(2)}x`;
  const relativeMarginsText =
    metrics.relativeMarginA === null || metrics.relativeMarginB === null
      ? 'Unavailable'
      : `A ±${formatPercent(metrics.relativeMarginA)}, B ±${formatPercent(metrics.relativeMarginB)}`;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <span className="font-medium text-sm">Comparison Insights</span>
        <p className="text-sm">
          <span className="font-medium">{verdict}:</span> Snippet{' '}
          {metrics.winner} appears faster by{' '}
          {formatDuration(metrics.absoluteDeltaMs)} per iteration (
          {formatPercent(metrics.percentDelta)}), about{' '}
          {metrics.speedup.toFixed(2)}x speedup.
        </p>
        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          <Metric label="Delta vs uncertainty" value={marginRatioText} />
          <Metric
            label="Combined margin"
            value={formatDuration(metrics.combinedMarginMs)}
          />
          <Metric label="A 95% interval" value={aIntervalText} />
          <Metric label="B 95% interval" value={bIntervalText} />
          <Metric label="CI overlap" value={overlapText} />
          <Metric label="Relative margins" value={relativeMarginsText} />
        </div>
        <p className="text-muted-fg text-xs">{metrics.confidenceText}</p>
      </CardContent>
    </Card>
  );
}

export function ComparisonResults({
  runState,
  resultA,
  resultB,
}: {
  runState: RunState;
  resultA: ExecutionResult | null;
  resultB: ExecutionResult | null;
}) {
  return (
    <>
      {resultA || resultB || runState === 'running' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ResultCard label="Result A" result={resultA} />
          <ResultCard label="Result B" result={resultB} />
        </div>
      ) : null}

      {runState === 'done' && resultA && resultB ? (
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <span className="font-medium text-sm">Comparison Summary</span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <ComparisonEntry other={resultB} result={resultA} which="a" />
                <span className="text-muted-fg text-sm">vs</span>
                <ComparisonEntry other={resultA} result={resultB} which="b" />
              </div>
            </CardContent>
          </Card>
          <ComparisonInsights resultA={resultA} resultB={resultB} />
        </div>
      ) : null}
    </>
  );
}
