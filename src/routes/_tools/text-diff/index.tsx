'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { ArrowLeftRight, Check, Copy, GitCompare, Link } from 'lucide-react';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import type {
  TextDiffLine,
  TextDiffResult,
  TextDiffWordChunk,
} from '@/lib/tools/text-diff/adapters/text-diff';
import { diffTexts } from '@/lib/tools/text-diff/adapters/text-diff';
import { buildTextDiffParams } from '@/lib/tools/text-diff/adapters/text-diff-params';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

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

function lineClassName(type: TextDiffLine['type']): string {
  if (type === 'added') {
    return 'bg-success/10 text-success';
  }
  if (type === 'removed') {
    return 'bg-danger/10 text-danger';
  }
  return 'text-muted-fg';
}

function lineMarker(type: TextDiffLine['type']): string {
  if (type === 'added') {
    return '+';
  }
  if (type === 'removed') {
    return '-';
  }
  return ' ';
}

function chunkClassName(type: TextDiffWordChunk['type']): string | undefined {
  if (type === 'added') {
    return 'rounded-sm bg-success/25';
  }
  if (type === 'removed') {
    return 'rounded-sm bg-danger/25';
  }
}

function TextDiffPage() {
  const { trackAction } = useToolTracking('text-diff', 'Text Diff');
  const search = useSearch({ from: '/_tools/text-diff/' });
  const [original, setOriginal] = useState(search.original ?? '');
  const [modified, setModified] = useState(search.modified ?? '');
  const [result, setResult] = useState<TextDiffResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState<'compare' | 'swap' | null>(
    null
  );

  const handleCompare = useCallback(() => {
    setResult(diffTexts(original, modified));
    setActiveAction('compare');
    setCopied(false);
    trackAction('compare');
  }, [original, modified, trackAction]);

  const handleSwap = useCallback(() => {
    setOriginal(modified);
    setModified(original);
    setResult(null);
    setActiveAction(null);
    trackAction('swap');
  }, [modified, original, trackAction]);

  const handleCopyDiff = useCallback(async () => {
    if (!result) {
      return;
    }
    const diffText = result.lines
      .filter((line) => line.type !== 'unchanged')
      .map((line) => `${line.type === 'added' ? '+' : '-'}${line.content}`)
      .join('\n');
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

          <div className="flex flex-wrap gap-2">
            <Button onPress={handleCompare} size="sm">
              <GitCompare className="size-4" />
              Compare
            </Button>
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

          {result?.isValid && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-fg text-sm">
                  {result.addedCount} additions, {result.removedCount} deletions
                </span>
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
              <div className="max-h-96 overflow-auto rounded-lg border bg-(--card-bg)/50 font-mono text-sm">
                {result.lines.map((line, index) => (
                  <div
                    className={`flex gap-2 whitespace-pre-wrap break-all px-3 py-0.5 ${lineClassName(line.type)}`}
                    /* biome-ignore lint/suspicious/noArrayIndexKey: static diff result, keys stay positional */
                    key={`${line.type}-${index}`}
                  >
                    <span className="w-4 shrink-0 select-none text-center opacity-70">
                      {lineMarker(line.type)}
                    </span>
                    {line.chunks
                      ? line.chunks.map((chunk, chunkIndex) => (
                          <span
                            className={chunkClassName(chunk.type)}
                            /* biome-ignore lint/suspicious/noArrayIndexKey: static chunk list, keys stay positional */
                            key={`${chunk.type}-${chunkIndex}`}
                          >
                            {chunk.text}
                          </span>
                        ))
                      : line.content}
                  </div>
                ))}
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
              'Green lines were added, red lines were removed, and highlighted words show the exact text that changed within a line.',
            question: 'What do the colors mean?',
          },
          {
            answer:
              'Each side can be up to 500,000 characters. Larger inputs are rejected to keep the page responsive.',
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
