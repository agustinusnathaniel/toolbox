'use client';

import { FileDiff, Virtualizer } from '@pierre/diffs/react';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { ArrowLeftRight, Check, Copy, GitCompare, Link } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { buildCopyDiffText } from '@/lib/tools/text-diff/adapters/text-diff';
import { buildTextDiffParams } from '@/lib/tools/text-diff/adapters/text-diff-params';
import {
  type DiffViewMode,
  isSplitViewUsable,
  resolveDiffViewMode,
} from '@/lib/tools/text-diff/adapters/text-diff-view-mode';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  DiffViewControl,
  SPLIT_VIEW_UNAVAILABLE_HINT_ID,
} from './-components/diff-view-control';
import { useContainerWidth } from './-components/use-container-width';
import { useTextDiff } from './-components/use-text-diff';
import { meta } from './-meta';

const searchSchema = z.object({
  modified: z.string().optional(),
  original: z.string().optional(),
});

export const Route = createFileRoute('/_tools/text-diff/')({
  component: TextDiffPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function TextDiffPage() {
  const { trackAction } = useToolTracking('text-diff', 'Text Diff');
  const search = useSearch({ from: '/_tools/text-diff/' });
  const { resolvedTheme } = useTheme();
  const [original, setOriginal] = useState(search.original ?? '');
  const [modified, setModified] = useState(search.modified ?? '');
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState<'compare' | 'swap' | null>(
    null
  );
  const [compareTrigger, setCompareTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<DiffViewMode>('unified');

  const { ref: diffContainerRef, width: diffContainerWidth } =
    useContainerWidth<HTMLDivElement>();
  const splitViewUsable = isSplitViewUsable(diffContainerWidth);
  const effectiveMode = resolveDiffViewMode(viewMode, splitViewUsable);

  const { computing, result, setResult } = useTextDiff(
    original,
    modified,
    compareTrigger
  );

  const handleCompare = useCallback(() => {
    setResult(null);
    setActiveAction('compare');
    setCopied(false);
    setCompareTrigger((trigger) => trigger + 1);
    trackAction('compare');
  }, [setResult, trackAction]);

  const handleSwap = useCallback(() => {
    setOriginal(modified);
    setModified(original);
    setResult(null);
    setActiveAction(null);
    trackAction('swap');
  }, [modified, original, setResult, trackAction]);

  const handleCopyDiff = useCallback(async () => {
    if (!result?.fileDiff) {
      return;
    }
    const diffText = buildCopyDiffText(result.fileDiff);
    const copied = await copyToClipboard(diffText, 'Copied Diff');
    if (copied) {
      setCopied(true);
      trackAction('copy');
      setTimeout(() => setCopied(false), 1500);
    }
  }, [result, trackAction]);

  const handleCopyLink = useCallback(async () => {
    const params = buildTextDiffParams(original, modified);
    const url = `${window.location.origin}${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    if (await copyToClipboard(url, 'Copied Shareable Link')) {
      trackAction('copy_link');
    }
  }, [modified, original, trackAction]);

  const showHint =
    original.trim() && modified.trim() && !result && !activeAction;
  const showError = result && !result.isValid;
  const fileDiff = result?.isValid && !result.timedOut ? result.fileDiff : null;

  const fileDiffOptions = useMemo(
    () => ({
      diffIndicators: 'classic' as const,
      diffStyle: effectiveMode,
      disableFileHeader: true,
      lineDiffType: 'word' as const,
      overflow: 'wrap' as const,
      theme: { dark: 'pierre-dark', light: 'pierre-light' },
      themeType:
        resolvedTheme === 'dark' ? ('dark' as const) : ('light' as const),
    }),
    [effectiveMode, resolvedTheme]
  );

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              className="text-muted-fg text-sm"
              htmlFor="text-diff-original"
            >
              Original
            </label>
            <textarea
              className="field-sizing-content min-h-32 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
              id="text-diff-original"
              onChange={(e) => {
                setOriginal(e.target.value);
                setResult(null);
                setActiveAction(null);
              }}
              placeholder="Paste the original text here..."
              value={original}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-muted-fg text-sm"
              htmlFor="text-diff-modified"
            >
              Modified
            </label>
            <textarea
              className="field-sizing-content min-h-32 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
              id="text-diff-modified"
              onChange={(e) => {
                setModified(e.target.value);
                setResult(null);
                setActiveAction(null);
              }}
              placeholder="Paste the modified text here..."
              value={modified}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onPress={handleCompare} size="sm">
              <GitCompare className="size-4" />
              Compare
            </Button>
            {computing && (
              <span aria-live="polite" className="text-muted-fg text-xs">
                Comparing…
              </span>
            )}
            <Button intent="outline" onPress={handleSwap} size="sm">
              <ArrowLeftRight className="size-4" />
              Swap
            </Button>
            <Button
              aria-label="Copy shareable link"
              intent="outline"
              onPress={handleCopyLink}
              size="sm"
            >
              <Link className="size-4" />
              Copy link
            </Button>
          </div>

          {showHint && (
            <p className="text-muted-fg text-xs">
              Click Compare to see the differences.
            </p>
          )}

          {showError && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">Input too large</p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {result?.timedOut && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">
                Comparison timed out
              </p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {fileDiff && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-fg text-sm">
                    {result?.addedCount ?? 0} additions,{' '}
                    {result?.removedCount ?? 0} deletions
                  </span>
                  <div className="flex items-center gap-2">
                    <DiffViewControl
                      effectiveMode={effectiveMode}
                      onModeChange={setViewMode}
                      splitDisabled={!splitViewUsable}
                    />
                    <Button
                      aria-label="Copy diff"
                      intent="outline"
                      onPress={handleCopyDiff}
                      size="sq-sm"
                    >
                      {copied ? (
                        <Check className="size-4 text-success" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {!splitViewUsable && (
                  <p
                    className="text-muted-fg text-xs"
                    id={SPLIT_VIEW_UNAVAILABLE_HINT_ID}
                  >
                    Split view needs a wider screen — showing Unified instead.
                  </p>
                )}
              </div>
              <div className="min-w-0" ref={diffContainerRef}>
                <Virtualizer className="max-h-96 overflow-auto rounded-lg border bg-(--card-bg)/50">
                  <FileDiff
                    disableWorkerPool
                    fileDiff={fileDiff}
                    options={fileDiffOptions}
                  />
                </Virtualizer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All comparison happens in your browser. Nothing is sent to a server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'Green lines were added, red lines were removed, and highlighted words show the exact text that changed within a line. Switch between Unified and Split views to see the diff side by side.',
            question: 'What do the colors mean?',
          },
          {
            answer:
              'Each side can be up to 500,000 characters. Large or heavily-changed inputs are computed in the background so the page stays responsive; comparisons that take too long show a timeout message.',
            question: 'What is the largest input supported?',
          },
        ]}
        howItWorks={{
          description:
            'Paste two versions of a text, then compare them to see what changed.',
          steps: [
            'Paste the original text into the first box',
            'Paste the modified text into the second box',
            'Click Compare to see the line-by-line differences',
            'Copy the diff or a shareable link with the buttons',
          ],
        }}
      />
    </div>
  );
}
