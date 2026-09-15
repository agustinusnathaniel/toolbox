'use client';

import { ArrowUpDown } from 'lucide-react';

import { CopyButton } from '@/lib/components/copy-button';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Label } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import { Textarea } from '@/lib/components/ui/textarea';
import type { CsvMode } from '@/lib/tools/csv-converter/adapters/csv-converter';

const MODE_OPTIONS: ReadonlyArray<{ id: CsvMode; label: string }> = [
  { id: 'csv-to-json', label: 'CSV to JSON' },
  { id: 'json-to-csv', label: 'JSON to CSV' },
];

export function CsvToolbar({
  computing,
  mode,
  onConvert,
  onModeChange,
}: {
  computing: boolean;
  mode: CsvMode;
  onConvert: () => void;
  onModeChange: (m: CsvMode) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <Label htmlFor="csv-mode">Mode</Label>
        <Select
          aria-label="Conversion mode"
          onSelectionChange={(key) => onModeChange(key as CsvMode)}
          selectedKey={mode}
        >
          <SelectTrigger />
          <SelectContent items={MODE_OPTIONS}>
            {(option) => <SelectItem id={option.id}>{option.label}</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button intent="primary" onPress={onConvert} size="sm">
          <ArrowUpDown className="size-4" />
          Convert
        </Button>
        {computing && (
          <span aria-live="polite" className="text-muted-fg text-xs">
            Converting…
          </span>
        )}
      </div>
    </div>
  );
}

export function CsvInput({
  input,
  mode,
  onInput,
}: {
  input: string;
  mode: CsvMode;
  onInput: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="csv-input">
        {mode === 'json-to-csv' ? 'JSON Input' : 'CSV Input'}
      </label>
      <Textarea
        aria-label="Input data"
        className="min-h-40 font-mono"
        id="csv-input"
        onChange={(e) => onInput(e.target.value)}
        placeholder={
          mode === 'json-to-csv'
            ? 'Paste your JSON here...'
            : 'Paste your CSV here...'
        }
        value={input}
      />
    </div>
  );
}

export function CsvActions({
  canCopy,
  copied,
  onCopy,
  onCopyLink,
}: {
  canCopy: boolean;
  copied: boolean;
  onCopy: () => void;
  onCopyLink: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyButton
        copied={copied}
        disabled={!canCopy}
        label="Copy output"
        onPress={onCopy}
        text="Copy output"
      />
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
    </div>
  );
}

export function CsvOutput({
  hasInput,
  mode,
  result,
}: {
  hasInput: boolean;
  mode: CsvMode;
  result: {
    error?: string;
    isValid: boolean;
    output?: string;
    timedOut?: boolean;
  } | null;
}) {
  return (
    <>
      {hasInput && !result && (
        <p className="text-muted-fg text-xs">
          Click Convert to{' '}
          {mode === 'json-to-csv' ? 'turn JSON into CSV' : 'turn CSV into JSON'}
          .
        </p>
      )}
      {result && !result.isValid && (
        <ToolError message={result.error} title="Conversion failed" />
      )}
      {result?.timedOut && (
        <ToolError message={result.error} title="Conversion timed out" />
      )}
      {result?.isValid && result.output && (
        <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
          {result.output}
        </pre>
      )}
    </>
  );
}

export function CsvHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Yes. All conversion uses Papa Parse in your browser. No data ever leaves your device.',
          question: 'Is my data safe?',
        },
        {
          answer:
            'CSV to JSON treats the first row as headers and keeps all values as strings. JSON to CSV flattens each object into a row and unions keys across all rows.',
          question: 'How does the conversion handle headers?',
        },
        {
          answer:
            'Conversions run in the background so the page stays responsive; conversions that take too long show a timeout message.',
          question: 'What is the largest input supported?',
        },
      ]}
      howItWorks={{
        description:
          'Pick a direction, paste your input, and convert. Copy the output or share a link that restores your input and mode.',
        steps: [
          'Choose CSV to JSON or JSON to CSV',
          'Paste your input into the textarea',
          'Click Convert',
          'Copy the output or copy a shareable link',
        ],
      }}
    />
  );
}
