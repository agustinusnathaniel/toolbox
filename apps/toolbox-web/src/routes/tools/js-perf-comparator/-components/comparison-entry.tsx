import type { ExecutionResult } from '@toolbox/js-perf-comp-core';
import { formatDuration } from '@toolbox/js-perf-comp-core';
import { BadgeCheck, BadgeX } from 'lucide-react';

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
    return <BadgeCheck className="inline size-3 text-success" />;
  }
  if (slower) {
    return <BadgeX className="inline size-3 text-danger" />;
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
        <span className="text-muted-fg text-xs">
          {getDurationIndicator(result.durationMs, other.durationMs, which)}
        </span>
      ) : null}
    </div>
  );
}
