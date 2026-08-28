'use client';

import { Check, Copy } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import type { TextDiffResult } from '@/lib/tools/text-diff/adapters/text-diff';
import type { DiffViewMode } from '@/lib/tools/text-diff/adapters/text-diff-view-mode';

import {
  DiffViewControl,
  SPLIT_VIEW_UNAVAILABLE_HINT_ID,
} from './diff-view-control';
import { DiffViewer } from './diff-viewer';

type DiffResultsProps = {
  result: TextDiffResult | null;
  computing: boolean;
  fileDiff: unknown;
  fileDiffOptions: Record<string, unknown>;
  copiedKey: string | null;
  view: {
    effectiveMode: DiffViewMode;
    splitUsable: boolean;
    setViewMode: (m: DiffViewMode) => void;
    ref: React.RefObject<HTMLDivElement | null>;
  };
  onCopyDiff: () => void;
  showError: boolean;
  showHint: boolean;
  showNoDifferences: boolean;
};

export function DiffHint({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }
  return (
    <p className="text-muted-fg text-xs">
      Click Compare to see the differences.
    </p>
  );
}

export function DiffError({ result }: { result: TextDiffResult | null }) {
  if (!(result && !result.isValid)) {
    return null;
  }
  return (
    <div
      className="rounded-lg border border-danger/30 bg-danger/5 p-3"
      role="alert"
    >
      <p className="font-medium text-danger text-sm">Input too large</p>
      <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
        {result.error}
      </pre>
    </div>
  );
}

export function DiffTimeout({ result }: { result: TextDiffResult | null }) {
  if (!result?.timedOut) {
    return null;
  }
  return (
    <div
      className="rounded-lg border border-danger/30 bg-danger/5 p-3"
      role="alert"
    >
      <p className="font-medium text-danger text-sm">Comparison timed out</p>
      <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
        {result.error}
      </pre>
    </div>
  );
}

export function DiffResults({
  result,
  fileDiff,
  fileDiffOptions,
  copiedKey,
  view,
  onCopyDiff,
  showNoDifferences,
}: DiffResultsProps) {
  if (!fileDiff || showNoDifferences) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-muted-fg text-sm">
            {result?.addedCount ?? 0} additions, {result?.removedCount ?? 0}{' '}
            deletions
          </span>
          <div className="flex items-center gap-2">
            <DiffViewControl
              effectiveMode={view.effectiveMode}
              onModeChange={view.setViewMode}
              splitDisabled={!view.splitUsable}
            />
            <Button
              aria-label="Copy diff"
              intent="outline"
              onPress={onCopyDiff}
              size="sq-sm"
            >
              {copiedKey === 'copy' ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>
        {!view.splitUsable && (
          <p
            className="text-muted-fg text-xs"
            id={SPLIT_VIEW_UNAVAILABLE_HINT_ID}
          >
            Split view needs a wider screen — showing Unified instead.
          </p>
        )}
      </div>
      <div
        className="min-w-0"
        ref={view.ref as React.RefObject<HTMLDivElement>}
      >
        <DiffViewer
          className="max-h-96 overflow-auto rounded-lg border bg-(--card-bg)/50"
          fileDiff={fileDiff as never}
          options={fileDiffOptions as never}
        />
      </div>
    </div>
  );
}

export function NoDifferences({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2" role="status">
      <span className="text-muted-fg text-sm">0 additions, 0 deletions</span>
      <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed bg-(--card-bg)/50 p-4">
        <p className="text-muted-fg text-sm">No differences found</p>
      </div>
    </div>
  );
}
