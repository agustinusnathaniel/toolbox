'use client';

import { RotateCcw } from 'lucide-react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { CopyRow } from '@/lib/components/copy-row';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';

export function TimestampInput({
  input,
  onCopyLink,
  onInput,
  onUseNow,
}: {
  input: string;
  onCopyLink: () => void;
  onInput: (v: string) => void;
  onUseNow: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-muted-fg text-sm" htmlFor="timestamp-input">
            Timestamp or Date
          </label>
          <Textarea
            className="min-h-24 font-mono text-xs"
            id="timestamp-input"
            onChange={(e) => onInput(e.target.value)}
            placeholder="Paste an epoch timestamp (10 or 13 digits) or a date string..."
            value={input}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button intent="outline" onPress={onUseNow} size="sm">
            <RotateCcw className="size-4" />
            Use current time
          </Button>
          <CopyLinkButton onPress={onCopyLink} />
        </div>
        {!input.trim() && (
          <p className="text-muted-fg text-xs">
            Paste a Unix timestamp or a date string above to convert it.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TimestampEpochCards({
  copiedKey,
  epochMillis,
  epochSeconds,
  onCopy,
}: {
  copiedKey: string | null;
  epochMillis?: string;
  epochSeconds?: string;
  onCopy: (k: string, v: string, l: string) => void;
}) {
  return (
    <Card>
      <CardHeader title="Epoch" />
      <CardContent className="flex flex-col">
        <CopyRow
          copied={copiedKey === 'seconds'}
          copyLabel="Copy epoch seconds"
          label="Seconds"
          mono
          onCopy={() =>
            onCopy('seconds', epochSeconds ?? '', 'Copied Epoch Seconds')
          }
          value={epochSeconds}
        />
        <CopyRow
          copied={copiedKey === 'milliseconds'}
          copyLabel="Copy epoch milliseconds"
          label="Milliseconds"
          mono
          onCopy={() =>
            onCopy(
              'milliseconds',
              epochMillis ?? '',
              'Copied Epoch Milliseconds'
            )
          }
          value={epochMillis}
        />
      </CardContent>
    </Card>
  );
}

export function TimestampDateCards({
  copiedKey,
  iso,
  local,
  onCopyIso,
  relative,
  utc,
}: {
  copiedKey: string | null;
  iso?: string;
  local?: string;
  onCopyIso: () => void;
  relative?: string;
  utc?: string;
}) {
  return (
    <Card>
      <CardHeader title="Date" />
      <CardContent className="flex flex-col">
        <CopyRow
          copied={copiedKey === 'iso'}
          copyLabel="Copy ISO 8601 date"
          label="ISO 8601"
          mono
          onCopy={onCopyIso}
          value={iso}
        />
        <CopyRow label="Local" value={local} />
        <CopyRow label="UTC" value={utc} />
        <CopyRow label="Relative" value={relative} />
      </CardContent>
    </Card>
  );
}

export function TimestampError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }
  return (
    <ToolError message={error} title="Invalid timestamp" variant="prose" />
  );
}

export function TimestampHelp() {
  return (
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
  );
}
