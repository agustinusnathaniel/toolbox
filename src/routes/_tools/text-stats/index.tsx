'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Copy, Link, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  buildStatsSummary,
  computeTextStats,
} from '@/lib/tools/text-stats/adapters/text-stats';
import {
  buildTextStatsParams,
  buildTextStatsStateFromSearch,
} from '@/lib/tools/text-stats/adapters/text-stats-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/text-stats/')({
  component: TextStatsPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

const HOW_IT_WORKS = {
  description: 'Paste text to see counts and reading time update live.',
  steps: [
    'Paste or type text into the input',
    'See characters, words, lines, and more update instantly',
    'Copy the summary or share a link',
  ],
};

const FAQ = [
  {
    answer:
      'Yes. All counting runs in your browser using pure string logic. No data is ever sent to a server.',
    question: 'Is my data safe?',
  },
  {
    answer:
      'Reading time uses 200 words per minute, rounded up to the next minute. Short texts under a minute show seconds.',
    question: 'How is reading time calculated?',
  },
] as const;

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-(--card-bg)/50 p-3">
      <span className="text-muted-fg text-xs">{label}</span>
      <span className="font-mono font-semibold text-sm">{value}</span>
    </div>
  );
}

function TextStatsPage() {
  const { trackAction } = useToolTracking('text-stats', 'Text Statistics');
  const search = useSearch({ from: '/_tools/text-stats/' });
  const [state, setState] = useState(() =>
    buildTextStatsStateFromSearch(search)
  );
  const { copiedKey, copy } = useCopyFeedback();
  const stats = useMemo(() => computeTextStats(state.input), [state.input]);
  const summary = useMemo(() => buildStatsSummary(stats), [stats]);

  const handleInputChange = useCallback((value: string) => {
    setState((prev) => ({ ...prev, input: value }));
  }, []);

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, input: '' }));
    trackAction('clear');
  }, [trackAction]);

  const handleCopySummary = useCallback(async () => {
    if (await copy(summary, 'summary', 'Copied summary')) {
      trackAction('copy');
    }
  }, [copy, summary, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildTextStatsParams(state.input),
    trackAction
  );

  const hasInput = state.input.trim().length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="text-stats-input">
              Text input
            </label>
            <Textarea
              aria-label="Text input"
              className="min-h-40 font-mono"
              id="text-stats-input"
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste or type text here..."
              value={state.input}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <StatCell label="Characters" value={stats.characters} />
            <StatCell label="Without spaces" value={stats.charactersNoSpaces} />
            <StatCell label="Words" value={stats.words} />
            <StatCell label="Lines" value={stats.lines} />
            <StatCell label="Paragraphs" value={stats.paragraphs} />
            <StatCell label="Sentences" value={stats.sentences} />
            <StatCell label="Bytes (UTF-8)" value={stats.bytesUtf8} />
            <StatCell label="Reading time" value={stats.readingTimeText} />
            <StatCell label="Avg word length" value={stats.averageWordLength} />
            <StatCell label="Longest word" value={stats.longestWordLength} />
          </div>

          {hasInput ? (
            <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <span className="text-muted-fg text-xs">{summary}</span>
              <Button
                aria-label="Copy summary"
                intent="outline"
                onPress={handleCopySummary}
                size="sq-sm"
              >
                <Copy className="size-4" />
              </Button>
              {copiedKey === 'summary' && (
                <span className="text-success text-xs">Copied</span>
              )}
            </div>
          ) : (
            <p className="text-muted-fg text-xs">
              Enter text to see statistics across all metrics.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button intent="outline" onPress={handleCopyLink} size="sm">
              <Link className="size-4" />
              Copy link
            </Button>
            <Button intent="outline" onPress={handleClear} size="sm">
              <Trash2 className="size-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <ToolHelp faq={[...FAQ]} howItWorks={HOW_IT_WORKS} />
    </div>
  );
}
