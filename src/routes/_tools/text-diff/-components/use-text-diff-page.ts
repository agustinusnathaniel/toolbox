'use client';

import { useSearch } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import { useCallback, useMemo, useState } from 'react';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  buildCopyDiffText,
  isNoDifferenceOutcome,
} from '@/lib/tools/text-diff/adapters/text-diff';
import { buildTextDiffParams } from '@/lib/tools/text-diff/adapters/text-diff-params';
import {
  type DiffViewMode,
  isSplitViewUsable,
  resolveDiffViewMode,
} from '@/lib/tools/text-diff/adapters/text-diff-view-mode';

import { useContainerWidth } from './use-container-width';
import { useTextDiff } from './use-text-diff';

export function useDiffViewState() {
  const [viewMode, setViewMode] = useState<DiffViewMode>('unified');
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const splitUsable = isSplitViewUsable(width);
  const effectiveMode = resolveDiffViewMode(viewMode, splitUsable);
  return { effectiveMode, ref, setViewMode, splitUsable, viewMode, width };
}

function useDiffCoreState() {
  const search = useSearch({ from: '/_tools/text-diff/' } as never) as {
    original?: string;
    modified?: string;
  };
  const [original, setOriginal] = useState(search.original ?? '');
  const [modified, setModified] = useState(search.modified ?? '');
  const [activeAction, setActiveAction] = useState<'compare' | 'swap' | null>(
    null
  );
  const [compareTrigger, setCompareTrigger] = useState(0);
  const { computing, result, setResult } = useTextDiff(
    original,
    modified,
    compareTrigger
  );
  return {
    activeAction,
    compareTrigger,
    computing,
    modified,
    original,
    result,
    setActiveAction,
    setCompareTrigger,
    setModified,
    setOriginal,
    setResult,
  };
}

function useDiffActions(
  core: ReturnType<typeof useDiffCoreState>,
  trackAction: (a: string) => void
) {
  const { copiedKey, copy } = useCopyFeedback();
  const handleCompare = useCallback(() => {
    core.setResult(null);
    core.setActiveAction('compare');
    core.setCompareTrigger((t) => t + 1);
    trackAction('compare');
    import('@pierre/diffs/react').catch(() => undefined);
  }, [
    core.setResult,
    core.setActiveAction,
    core.setCompareTrigger,
    trackAction,
  ]);

  const handleSwap = useCallback(() => {
    core.setOriginal(core.modified);
    core.setModified(core.original);
    core.setResult(null);
    core.setActiveAction(null);
    trackAction('swap');
  }, [
    core.modified,
    core.original,
    core.setResult,
    core.setActiveAction,
    trackAction,
    core.setOriginal,
    core.setModified,
  ]);

  const handleCopyDiff = useCallback(async () => {
    if (!core.result?.fileDiff) {
      return;
    }
    const diffText = buildCopyDiffText(core.result.fileDiff);
    if (await copy(diffText, 'copy', 'Copied Diff')) {
      trackAction('copy');
    }
  }, [core.result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildTextDiffParams(core.original, core.modified),
    trackAction
  );

  return {
    copiedKey,
    handleCompare,
    handleCopyDiff,
    handleCopyLink,
    handleSwap,
  };
}

export function useTextDiffPageState() {
  const { trackAction } = useToolTracking('text-diff', 'Text Diff');
  const { resolvedTheme } = useTheme();
  const core = useDiffCoreState();
  const actions = useDiffActions(core, trackAction);
  const view = useDiffViewState();

  const showHint =
    core.original.trim() &&
    core.modified.trim() &&
    !core.result &&
    !core.activeAction;
  const showError = core.result && !core.result.isValid;
  const fileDiff =
    core.result?.isValid && !core.result.timedOut ? core.result.fileDiff : null;
  const showNoDifferences =
    core.result !== null &&
    isNoDifferenceOutcome(core.original, core.modified, core.result);

  const themeType =
    resolvedTheme === 'dark' ? ('dark' as const) : ('light' as const);
  const fileDiffOptions = useMemo(
    () => ({
      diffIndicators: 'classic' as const,
      diffStyle: view.effectiveMode,
      disableFileHeader: true,
      lineDiffType: 'word' as const,
      overflow: 'wrap' as const,
      theme: { dark: 'pierre-dark', light: 'pierre-light' },
      themeType,
    }),
    [view.effectiveMode, themeType]
  );

  return {
    activeAction: core.activeAction,
    computing: core.computing,
    copiedKey: actions.copiedKey,
    fileDiff,
    fileDiffOptions,
    handleCompare: actions.handleCompare,
    handleCopyDiff: actions.handleCopyDiff,
    handleCopyLink: actions.handleCopyLink,
    handleSwap: actions.handleSwap,
    modified: core.modified,
    original: core.original,
    result: core.result,
    setActiveAction: core.setActiveAction,
    setModified: core.setModified,
    setOriginal: core.setOriginal,
    setResult: core.setResult,
    showError,
    showHint,
    showNoDifferences,
    view,
  };
}
