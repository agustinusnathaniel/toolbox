import { BadgeCheck, BadgeX } from 'lucide-react';

import type { ExecutionResult } from '@/lib/js-perf-comp-core/models';
import { formatDuration } from '@/lib/js-perf-comp-core/models';

import { StatusBadge } from './status-badge';

function getDurationIndicator(
  msA: number | null,
  msB: number | null,
  which: 'a' | 'b'
): React.ReactNode {
  if (msA === null || msB === null) {
    return null;
  }
  const faster = which === 'a' ? msA < msB : msB < msA;
  const slower = which === 'a' ? msA > msB : msB > msA;
  if (faster) {
    return (
      <>
        <BadgeCheck
          aria-hidden="true"
          className="inline size-3 text-emerald-600 dark:text-emerald-400"
        />
        <span className="sr-only">faster</span>
      </>
    );
  }
  if (slower) {
    return (
      <>
        <BadgeX aria-hidden="true" className="inline size-3 text-destructive" />
        <span className="sr-only">slower</span>
      </>
    );
  }
  return <span>≈</span>;
}

export function ComparisonEntry({
  result,
  other,
  which,
}: {
  result: ExecutionResult;
  other: ExecutionResult;
  which: 'a' | 'b';
}) {
  const showIndicator =
    result.status === 'success' &&
    other.status === 'success' &&
    result.durationMs !== null &&
    other.durationMs !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge result={result} />
      <span className="font-mono text-sm">
        {formatDuration(result.durationMs)}
      </span>
      {showIndicator ? (
        <span className="text-muted-foreground text-xs">
          {getDurationIndicator(result.durationMs, other.durationMs, which)}
        </span>
      ) : null}
    </div>
  );
}
