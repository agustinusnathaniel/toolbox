'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Copy, Link as LinkIcon, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import { convertTimestamp } from '@/lib/tools/timestamp-converter/adapters/timestamp-converter';
import { buildTimestampParams } from '@/lib/tools/timestamp-converter/adapters/timestamp-params';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  ts: z.string().optional(),
});

export const Route = createFileRoute('/_tools/timestamp-converter/')({
  component: TimestampConverterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

interface CopyRowProps {
  copied?: boolean;
  copyLabel?: string;
  label: string;
  mono?: boolean;
  onCopy?: () => void;
  value: string | undefined;
}

const CopyRow = ({
  copied,
  copyLabel,
  label,
  mono,
  onCopy,
  value,
}: CopyRowProps) => {
  if (!value) {
    return null;
  }
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-muted-fg text-sm">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`break-all text-right font-medium text-sm ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value}
        </span>
        {onCopy && copyLabel && (
          <Button
            aria-label={copyLabel}
            intent="outline"
            onPress={onCopy}
            size="sq-sm"
          >
            {copied ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

function TimestampConverterPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'timestamp-converter',
    'Timestamp Converter'
  );
  const search = useSearch({ from: '/_tools/timestamp-converter/' });
  const [input, setInput] = useState(search.ts ?? '');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const result = useMemo(() => convertTimestamp(input), [input]);

  useEffect(() => {
    trackAction('view');
    trackComplete(true);
  }, [trackAction, trackComplete]);

  const handleCopy = useCallback(
    async (key: string, value: string, label: string) => {
      if (await copyToClipboard(value, label)) {
        setCopiedKey(key);
        trackAction('copy');
        setTimeout(() => setCopiedKey(null), 1500);
      }
    },
    [trackAction]
  );

  const handleUseNow = useCallback(() => {
    setInput(String(Math.floor(Date.now() / 1000)));
    trackAction('use_now');
  }, [trackAction]);

  const handleCopyLink = useCallback(async () => {
    const params = buildTimestampParams(input);
    const url = `${window.location.origin}${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    if (await copyToClipboard(url, 'Copied Shareable Link')) {
      trackAction('copy_link');
    }
  }, [input, trackAction]);

  const hasInput = input.trim().length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="timestamp-input">
              Timestamp or Date
            </label>
            <Textarea
              className="min-h-24 font-mono text-xs"
              id="timestamp-input"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste an epoch timestamp (10 or 13 digits) or a date string..."
              value={input}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button intent="outline" onPress={handleUseNow} size="sm">
              <RotateCcw className="size-4" />
              Use current time
            </Button>
            <Button intent="outline" onPress={handleCopyLink} size="sm">
              <LinkIcon className="size-4" />
              Copy link
            </Button>
          </div>

          {!hasInput && (
            <p className="text-muted-fg text-xs">
              Paste a Unix timestamp or a date string above to convert it.
            </p>
          )}
        </CardContent>
      </Card>

      {result.error && hasInput && (
        <div
          className="rounded-lg border border-danger/30 bg-danger/5 p-3"
          role="alert"
        >
          <p className="font-medium text-danger text-sm">Invalid timestamp</p>
          <p className="mt-1 whitespace-pre-wrap text-danger/80 text-xs">
            {result.error}
          </p>
        </div>
      )}

      {result.isValid && hasInput && (
        <>
          <Card>
            <CardHeader title="Epoch" />
            <CardContent className="flex flex-col">
              <CopyRow
                copied={copiedKey === 'seconds'}
                copyLabel="Copy epoch seconds"
                label="Seconds"
                mono
                onCopy={() =>
                  handleCopy(
                    'seconds',
                    result.epochSeconds ?? '',
                    'Copied Epoch Seconds'
                  )
                }
                value={result.epochSeconds}
              />
              <CopyRow
                copied={copiedKey === 'milliseconds'}
                copyLabel="Copy epoch milliseconds"
                label="Milliseconds"
                mono
                onCopy={() =>
                  handleCopy(
                    'milliseconds',
                    result.epochMillis ?? '',
                    'Copied Epoch Milliseconds'
                  )
                }
                value={result.epochMillis}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Date" />
            <CardContent className="flex flex-col">
              <CopyRow
                copied={copiedKey === 'iso'}
                copyLabel="Copy ISO 8601 date"
                label="ISO 8601"
                mono
                onCopy={() =>
                  handleCopy('iso', result.iso ?? '', 'Copied ISO 8601')
                }
                value={result.iso}
              />
              <CopyRow label="Local" value={result.local} />
              <CopyRow label="UTC" value={result.utc} />
              <CopyRow label="Relative" value={result.relative} />
            </CardContent>
          </Card>
        </>
      )}

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All conversion happens locally in your browser. No data is sent to any server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'A Unix timestamp is the number of seconds (or milliseconds) that have elapsed since January 1, 1970, UTC. This tool converts between that number and a human-readable date.',
            question: 'What is a Unix timestamp?',
          },
        ]}
        howItWorks={{
          description:
            'Paste an epoch timestamp or a date string into the textarea. Results update live as you type.',
          steps: [
            'Paste a Unix timestamp (10 or 13 digits) or a date string',
            'Results update live — seconds, milliseconds, and formatted dates',
            'Click Use current time to insert the current epoch seconds',
            'Copy any value or the shareable link',
          ],
        }}
      />
    </div>
  );
}
