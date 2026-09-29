'use client';

import type { FileDiffMetadata, FileDiffOptions } from '@pierre/diffs';
import { lazy, Suspense } from 'react';

import { Skeleton } from '@/lib/components/ui/skeleton';

interface DiffViewerProps {
  className?: string;
  fileDiff: FileDiffMetadata;
  options: FileDiffOptions<undefined>;
}

/**
 * Lazy-loaded diff renderer. @pierre/diffs/react is heavy (~141 kB gzip) and
 * only needed once a comparison exists, so it is imported on demand — mirrors
 * the monaco-editor lazy pattern in the js-perf tool. The route chunk stays
 * small on navigation; the renderer chunk loads on the first Compare.
 */
const PierreDiffView = lazy(async () => {
  const { FileDiff, Virtualizer } = await import('@pierre/diffs/react');
  return {
    default: ({ className, fileDiff, options }: DiffViewerProps) => (
      <Virtualizer className={className}>
        <FileDiff disableWorkerPool fileDiff={fileDiff} options={options} />
      </Virtualizer>
    ),
  };
});

export function DiffViewer({ className, fileDiff, options }: DiffViewerProps) {
  return (
    <Suspense
      fallback={
        <Skeleton
          aria-label="Loading diff view"
          className="h-96 w-full rounded-lg border"
          isLoading
          role="status"
        />
      }
    >
      <PierreDiffView
        className={className}
        fileDiff={fileDiff}
        options={options}
      />
    </Suspense>
  );
}
