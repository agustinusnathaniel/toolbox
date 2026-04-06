import type { ExecutionResult } from '@toolbox/js-perf-comp-core';
import { formatDuration, formatStatistics } from '@toolbox/js-perf-comp-core';

import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';

import { StatusBadge } from './status-badge';

function createOutputPreview(
  output: Array<string>
): Array<{ key: string; line: string }> {
  const lineCounts = new Map<string, number>();
  return output.slice(0, 20).map((line) => {
    const count = (lineCounts.get(line) ?? 0) + 1;
    lineCounts.set(line, count);
    return { line, key: `${line}-${count}` };
  });
}

export function ResultCard({
  label,
  result,
}: {
  label: string;
  result: ExecutionResult | null;
}) {
  const relativeMargin =
    result?.statistics && result.statistics.meanMs > 0
      ? (result.statistics.marginMs / result.statistics.meanMs) * 100
      : null;

  const variability =
    result?.statistics && result.statistics.meanMs > 0
      ? (result.statistics.stddevMs / result.statistics.meanMs) * 100
      : null;
  const outputPreview = result ? createOutputPreview(result.output) : [];

  return (
    <Card>
      <CardHeader title={label} />
      <CardContent className="flex flex-col gap-3">
        {result ? (
          <>
            <div className="flex items-center gap-2">
              <StatusBadge result={result} />
              <span className="font-mono text-muted-fg text-sm">
                {formatDuration(result.durationMs)}
              </span>
              {result.statistics && (
                <span className="text-muted-fg text-xs">
                  ({formatStatistics(result.statistics)})
                </span>
              )}
            </div>
            {result.status === 'success' && result.statistics ? (
              <div className="grid grid-cols-1 gap-1 rounded-md border border-border/60 bg-muted/20 px-2 py-1.5 text-xs sm:grid-cols-2">
                <span className="text-muted-fg">
                  Per iteration:{' '}
                  <span className="font-medium text-fg">
                    {formatDuration(result.perIterationMs)}
                  </span>
                </span>
                <span className="text-muted-fg">
                  Range:{' '}
                  <span className="font-medium text-fg">
                    {formatDuration(result.statistics.minMs)} -{' '}
                    {formatDuration(result.statistics.maxMs)}
                  </span>
                </span>
                <span className="text-muted-fg">
                  Std dev:{' '}
                  <span className="font-medium text-fg">
                    {formatDuration(result.statistics.stddevMs)}
                  </span>
                </span>
                <span className="text-muted-fg">
                  Relative margin:{' '}
                  <span className="font-medium text-fg">
                    {relativeMargin === null
                      ? '—'
                      : `${relativeMargin.toFixed(2)}%`}
                  </span>
                </span>
                <span className="text-muted-fg">
                  Variability:{' '}
                  <span className="font-medium text-fg">
                    {variability === null ? '—' : `${variability.toFixed(2)}%`}
                  </span>
                </span>
                <span className="text-muted-fg">
                  Runs:{' '}
                  <span className="font-medium text-fg">
                    {result.statistics.iterations}
                  </span>
                </span>
              </div>
            ) : null}
            {result.errorMessage && (
              <div className="rounded-md border border-danger/30 bg-danger/5 p-2 font-mono text-danger text-xs">
                {result.errorMessage}
              </div>
            )}
            {result.output.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="font-medium text-muted-fg text-xs">
                  Output:
                </span>
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 p-2 font-mono text-xs">
                  {outputPreview.map((entry) => (
                    <span className="text-fg" key={entry.key}>
                      {entry.line}
                    </span>
                  ))}
                  {result.output.length > 20 && (
                    <span className="text-muted-fg">
                      ... +{result.output.length - 20} more lines
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <span className="text-muted-fg text-sm">No result yet</span>
        )}
      </CardContent>
    </Card>
  );
}
