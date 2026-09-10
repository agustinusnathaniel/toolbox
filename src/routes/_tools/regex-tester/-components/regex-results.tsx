'use client';

import { ToolError } from '@/lib/components/tool-error';
import type { RegexTestResult } from '@/lib/tools/regex-tester/adapters/regex';

export function RegexTimeout({ result }: { result: RegexTestResult }) {
  if (!result.timedOut) {
    return null;
  }
  return (
    <ToolError
      hint="This usually means catastrophic backtracking. Try simplifying the pattern or reducing the input length."
      message={result.error}
      title="Pattern took too long"
      variant="prose"
    />
  );
}

export function RegexTruncated({ result }: { result: RegexTestResult }) {
  if (!result.truncated) {
    return null;
  }
  return (
    <div
      className="rounded-lg border border-warning/30 bg-warning/5 p-3"
      role="alert"
    >
      <p className="font-medium text-sm text-warning">
        Showing first {result.matches.length.toLocaleString()} matches
      </p>
      <p className="mt-1 text-warning/80 text-xs">
        The pattern produced more matches than can be shown at once. Refine the
        pattern or use a shorter input to see all matches.
      </p>
    </div>
  );
}

export function RegexError({ result }: { result: RegexTestResult }) {
  if (!result.error || result.timedOut) {
    return null;
  }
  return (
    <ToolError message={result.error} title="Invalid regular expression" />
  );
}

export function RegexHighlights({
  segments,
}: {
  segments: Array<{ matched: boolean; start: number; text: string }>;
}) {
  if (segments.length === 0) {
    return null;
  }
  return (
    <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
      {segments.map((segment) =>
        segment.matched ? (
          <mark className="rounded bg-primary/20 text-fg" key={segment.start}>
            {segment.text}
          </mark>
        ) : (
          <span key={segment.start}>{segment.text}</span>
        )
      )}
    </pre>
  );
}

export function RegexMatchList({ result }: { result: RegexTestResult }) {
  if (result.matches.length === 0) {
    return null;
  }
  return (
    <ol className="flex max-h-80 flex-col gap-2 overflow-auto">
      {result.matches.map((match) => (
        <li
          className="rounded-lg border bg-(--card-bg)/50 p-3"
          key={match.index}
        >
          <div className="flex items-center justify-between gap-2">
            <code className="min-w-0 truncate font-mono text-sm">
              {match.full}
            </code>
            <span className="shrink-0 text-muted-fg text-xs">
              index {match.index}
            </span>
          </div>
          {match.groups.some((g) => g !== undefined) && (
            <div className="mt-1 flex flex-col gap-0.5">
              {match.groups
                .map((group, groupIndex) => ({ group, groupIndex }))
                .filter((e) => e.group !== undefined)
                .map((entry) => (
                  <code className="font-mono text-xs" key={entry.groupIndex}>
                    group {entry.groupIndex + 1}: {entry.group}
                  </code>
                ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
