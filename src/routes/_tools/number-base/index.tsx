'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Link, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { CopyRow } from '@/lib/components/copy-row';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Label } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import { Textarea } from '@/lib/components/ui/textarea';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { NumberBase } from '@/lib/tools/number-base/adapters/number-base';
import { convertNumberBase } from '@/lib/tools/number-base/adapters/number-base';
import {
  buildNumberBaseParams,
  buildNumberBaseStateFromSearch,
} from '@/lib/tools/number-base/adapters/number-base-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  from: z.string().optional(),
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/number-base/')({
  component: NumberBasePage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

const FROM_OPTIONS: ReadonlyArray<{ id: NumberBase; label: string }> = [
  { id: 2, label: 'Binary (base 2)' },
  { id: 8, label: 'Octal (base 8)' },
  { id: 10, label: 'Decimal (base 10)' },
  { id: 16, label: 'Hex (base 16)' },
];

function NumberBaseInput({
  input,
  fromBase,
  onInputChange,
  onFromChange,
}: {
  input: string;
  fromBase: NumberBase;
  onInputChange: (v: string) => void;
  onFromChange: (v: NumberBase) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="number-base-from">From base</Label>
        <Select
          aria-label="From base"
          onSelectionChange={(key) => onFromChange(key as NumberBase)}
          selectedKey={fromBase}
        >
          <SelectTrigger id="number-base-from" />
          <SelectContent items={FROM_OPTIONS}>
            {(option) => <SelectItem id={option.id}>{option.label}</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-muted-fg text-sm" htmlFor="number-base-input">
          Number input
        </label>
        <Textarea
          aria-label="Number input"
          className="font-mono"
          id="number-base-input"
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Enter number... e.g. 255, 0xFF, 0b1010"
          value={input}
        />
      </div>
    </div>
  );
}

function NumberBaseOutputs({
  result,
  hasInput,
  copiedKey,
  onCopy,
}: {
  result: ReturnType<typeof convertNumberBase>;
  hasInput: boolean;
  copiedKey: string | null;
  onCopy: (key: string, value: string, label: string) => void;
}) {
  if (!hasInput) {
    return (
      <p className="text-muted-fg text-xs">
        Enter a number to see conversions across all bases.
      </p>
    );
  }
  if (!result.isValid) {
    return (
      <div
        className="rounded-lg border border-danger/30 bg-danger/5 p-3"
        role="alert"
      >
        <p className="font-medium text-danger text-sm">{result.error}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col divide-y rounded-lg border">
      <CopyRow
        copied={copiedKey === 'binary'}
        copyLabel="Copy binary"
        label="Binary"
        mono
        onCopy={() => onCopy('binary', result.binary, 'Copied binary')}
        value={result.binary}
      />
      <CopyRow
        copied={copiedKey === 'octal'}
        copyLabel="Copy octal"
        label="Octal"
        mono
        onCopy={() => onCopy('octal', result.octal, 'Copied octal')}
        value={result.octal}
      />
      <CopyRow
        copied={copiedKey === 'decimal'}
        copyLabel="Copy decimal"
        label="Decimal"
        mono
        onCopy={() => onCopy('decimal', result.decimal, 'Copied decimal')}
        value={result.decimal}
      />
      <CopyRow
        copied={copiedKey === 'hex'}
        copyLabel="Copy hex"
        label="Hex"
        mono
        onCopy={() => onCopy('hex', result.hex, 'Copied hex')}
        value={result.hex}
      />
    </div>
  );
}

const HOW_IT_WORKS = {
  description: 'Enter a number and pick its base. All conversions update live.',
  steps: [
    'Select the base of your input number',
    'Type or paste the number (prefixes like 0x, 0b, 0o are optional)',
    'See binary, octal, decimal, and hex update instantly',
    'Copy any output or share a link',
  ],
};

const FAQ = [
  {
    answer:
      'Yes. All conversions run in your browser using BigInt. No data is ever sent to a server.',
    question: 'Is my data safe?',
  },
  {
    answer:
      'Supported bases: binary (2), octal (8), decimal (10), and hexadecimal (16). Hex output is uppercase.',
    question: 'Which bases are supported?',
  },
] as const;

function useNumberBaseState() {
  const search = useSearch({ from: '/_tools/number-base/' });
  const [state, setState] = useState(() =>
    buildNumberBaseStateFromSearch(search)
  );
  return [state, setState] as const;
}

function NumberBasePage() {
  const { trackAction } = useToolTracking(
    'number-base',
    'Number Base Converter'
  );
  const [state, setState] = useNumberBaseState();
  const { copiedKey, copy } = useCopyFeedback();
  const result = useMemo(
    () => convertNumberBase(state.input, state.fromBase),
    [state.input, state.fromBase]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: setState is stable
  const handleInputChange = useCallback((input: string) => {
    setState((prev) => ({ ...prev, input }));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setState is stable
  const handleFromChange = useCallback((fromBase: NumberBase) => {
    setState((prev) => ({ ...prev, fromBase }));
  }, []);

  const handleCopy = useCallback(
    async (key: string, value: string, label: string) => {
      if (await copy(value, key, label)) {
        trackAction('copy');
      }
    },
    [copy, trackAction]
  );

  const handleCopyLink = useCopyShareableLink(
    () => buildNumberBaseParams(state.input, state.fromBase),
    trackAction
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: setState is stable
  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, input: '' }));
    trackAction('clear');
  }, [trackAction]);

  const hasInput = state.input.trim().length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <NumberBaseInput
            fromBase={state.fromBase}
            input={state.input}
            onFromChange={handleFromChange}
            onInputChange={handleInputChange}
          />
          <NumberBaseOutputs
            copiedKey={copiedKey}
            hasInput={hasInput}
            onCopy={handleCopy}
            result={result}
          />
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
