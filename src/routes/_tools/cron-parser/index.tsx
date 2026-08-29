'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Copy, Link } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Input } from '@/lib/components/ui/input';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  buildCronParams,
  buildCronStateFromSearch,
} from '@/lib/tools/cron-parser/adapters/cron-params';
import {
  CRON_EXAMPLES,
  parseCronExpression,
} from '@/lib/tools/cron-parser/adapters/cron-parser';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  expression: z.string().optional(),
});

export const Route = createFileRoute('/_tools/cron-parser/')({
  component: CronParserPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function useCronState() {
  const search = useSearch({ from: '/_tools/cron-parser/' });
  const [expression, setExpression] = useState(
    () => buildCronStateFromSearch(search).expression
  );
  return { expression, setExpression };
}

function useCronResult(expression: string) {
  return useMemo(() => {
    if (!expression.trim()) {
      return null;
    }
    return parseCronExpression(expression);
  }, [expression]);
}

function useCronActions(
  result: ReturnType<typeof parseCronExpression> | null,
  setExpression: (v: string) => void,
  trackAction: (a: string) => void,
  copy: (text: string, key: string, toast: string) => Promise<boolean>
) {
  const handleSelectExample = useCallback(
    (ex: string) => {
      setExpression(ex);
      trackAction('example');
    },
    [trackAction, setExpression]
  );
  const handleCopyDescription = useCallback(async () => {
    if (!result?.humanReadable) {
      return;
    }
    if (await copy(result.humanReadable, 'description', 'Copied description')) {
      trackAction('copy_description');
    }
  }, [copy, result, trackAction]);
  const handleCopyRuns = useCallback(async () => {
    if (!result?.nextRuns?.length) {
      return;
    }
    if (await copy(result.nextRuns.join('\n'), 'runs', 'Copied run times')) {
      trackAction('copy_runs');
    }
  }, [copy, result, trackAction]);
  const handleCopySingleRun = useCallback(
    async (run: string, index: number) => {
      if (await copy(run, `run-${index}`, 'Copied run time')) {
        trackAction('copy_run');
      }
    },
    [copy, trackAction]
  );
  return {
    handleCopyDescription,
    handleCopyRuns,
    handleCopySingleRun,
    handleSelectExample,
  };
}

function CronInput({
  expression,
  setExpression,
}: {
  expression: string;
  setExpression: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="cron-expression">
        Cron expression
      </label>
      <Input
        aria-label="Cron expression"
        className="font-mono"
        id="cron-expression"
        onChange={(e) => setExpression(e.target.value)}
        placeholder="0 * * * *"
        value={expression}
      />
      <p className="text-muted-fg text-xs">
        5 fields: minute hour day month weekday — e.g. 0 9 * * 1
      </p>
    </div>
  );
}

function CronExamples({ onSelect }: { onSelect: (ex: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CRON_EXAMPLES.map((example) => (
        <Button
          aria-label={`Use example ${example.expression}: ${example.description}`}
          intent="outline"
          key={example.expression}
          onPress={() => onSelect(example.expression)}
          size="xs"
        >
          {example.expression}
        </Button>
      ))}
    </div>
  );
}

function CronError({
  result,
}: {
  result: ReturnType<typeof parseCronExpression> | null;
}) {
  if (!(result && !result.isValid)) {
    return null;
  }
  return (
    <div
      className="rounded-lg border border-danger/30 bg-danger/5 p-3"
      role="alert"
    >
      <p className="font-medium text-danger text-sm">Invalid cron expression</p>
      <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
        {result.error}
      </pre>
    </div>
  );
}

function CronHumanReadable({
  result,
  copiedKey,
  onCopy,
}: {
  result: ReturnType<typeof parseCronExpression> | null;
  copiedKey: string | null;
  onCopy: () => void;
}) {
  if (!result?.isValid) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-fg text-sm">Human readable</span>
        <Button
          aria-label="Copy description"
          intent="outline"
          onPress={onCopy}
          size="sq-sm"
        >
          {copiedKey === 'description' ? (
            <Check className="size-4 text-success" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>
      <p className="rounded-lg border bg-(--card-bg)/50 p-3 text-sm">
        {result.humanReadable}
      </p>
    </div>
  );
}

function CronNextRuns({
  result,
  copiedKey,
  onCopyRuns,
  onCopySingleRun,
}: {
  result: ReturnType<typeof parseCronExpression> | null;
  copiedKey: string | null;
  onCopyRuns: () => void;
  onCopySingleRun: (run: string, index: number) => void;
}) {
  if (!result?.isValid) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-fg text-sm">
          Next {result.nextRuns?.length ?? 0} runs
        </span>
        <Button
          aria-label="Copy all run times"
          intent="outline"
          onPress={onCopyRuns}
          size="sq-sm"
        >
          {copiedKey === 'runs' ? (
            <Check className="size-4 text-success" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {(result.nextRuns ?? []).map((run, index) => (
          <li
            className="flex items-center justify-between gap-2 rounded-lg border bg-(--card-bg)/50 px-3 py-2"
            key={run}
          >
            <span className="font-mono text-sm">
              {new Date(run).toLocaleString()}
            </span>
            <span className="hidden font-mono text-muted-fg text-xs sm:inline">
              {run}
            </span>
            <Button
              aria-label={`Copy run time ${index + 1}`}
              intent="outline"
              onPress={() => onCopySingleRun(run, index)}
              size="sq-sm"
            >
              {copiedKey === `run-${index}` ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CronParserPage() {
  const { trackAction } = useToolTracking(
    'cron-parser',
    'Cron Expression Parser'
  );
  const { expression, setExpression } = useCronState();
  const { copiedKey, copy } = useCopyFeedback();
  const result = useCronResult(expression);
  const {
    handleCopyDescription,
    handleCopyRuns,
    handleCopySingleRun,
    handleSelectExample,
  } = useCronActions(result, setExpression, trackAction, copy);
  const handleCopyLink = useCopyShareableLink(
    () => buildCronParams(expression),
    trackAction
  );
  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <CronInput expression={expression} setExpression={setExpression} />
          <CronExamples onSelect={handleSelectExample} />
          <div className="flex flex-wrap gap-2">
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
          <CronError result={result} />
          <CronHumanReadable
            copiedKey={copiedKey}
            onCopy={handleCopyDescription}
            result={result}
          />
          <CronNextRuns
            copiedKey={copiedKey}
            onCopyRuns={handleCopyRuns}
            onCopySingleRun={handleCopySingleRun}
            result={result}
          />
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. Parsing and preview generation run entirely in your browser. Your cron expression never leaves your device.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'This tool supports standard 5-field cron (minute hour day month weekday). For example, 0 9 * * 1 means at 09:00 on Monday. Use */5 * * * * for every 5 minutes.',
            question: 'Which cron format is supported?',
          },
        ]}
        howItWorks={{
          description:
            'Type a 5-field cron expression to see a human-readable summary and the next run times.',
          steps: [
            'Enter a cron expression like 0 * * * *',
            'Review the human-readable description',
            'Check the next 5 scheduled run times',
            'Click an example chip to try a common pattern or copy a shareable link',
          ],
        }}
      />
    </div>
  );
}
