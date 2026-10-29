'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { ArrowLeftRight, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { CopyRow } from '@/lib/components/copy-row';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Field, FieldLabel } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { UnitCategory } from '@/lib/tools/unit-converter/adapters/unit-converter';
import {
  convertUnit,
  getUnitsForCategory,
  UNIT_CATEGORIES,
} from '@/lib/tools/unit-converter/adapters/unit-converter';
import {
  buildUnitConverterParams,
  buildUnitConverterStateFromSearch,
} from '@/lib/tools/unit-converter/adapters/unit-converter-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  category: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  value: z.string().optional(),
});

export const Route = createFileRoute('/_tools/unit-converter/')({
  component: UnitConverterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

const CATEGORY_OPTIONS = UNIT_CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
}));

const HOW_IT_WORKS = {
  description: 'Enter a value, pick units, and see the conversion update live.',
  steps: [
    'Select a category (Length, Weight, Temperature, Volume, Data)',
    'Choose from and to units and enter a value',
    'See the converted result update instantly',
    'Swap units, copy the result, or share a link',
  ],
};

const FAQ = [
  {
    answer:
      'Yes. All conversions run in your browser with pure math. No data is ever sent to a server.',
    question: 'Is my data safe?',
  },
  {
    answer:
      'Temperature uses exact formulas: C to F is C*9/5+32, C to K is C+273.15, and inverses. Results are rounded to 10 decimal places.',
    question: 'How are temperature conversions calculated?',
  },
] as const;

function useUnitConverterState() {
  const search = useSearch({ from: '/_tools/unit-converter/' });
  const [state, setState] = useState(() =>
    buildUnitConverterStateFromSearch(search)
  );
  return [state, setState] as const;
}

function ConversionOutput({
  copiedKey,
  hasInput,
  onCopy,
  result,
}: {
  copiedKey: string | null;
  hasInput: boolean;
  onCopy: () => void;
  result: ReturnType<typeof convertUnit>;
}) {
  if (!hasInput) {
    return (
      <p className="text-muted-foreground text-xs">
        Enter a value to see the conversion.
      </p>
    );
  }
  if (!result.isValid) {
    return <ToolError title={result.error ?? 'Invalid input'} />;
  }
  return (
    <CopyRow
      copied={copiedKey === 'result'}
      copyLabel="Copy result"
      label="Result"
      mono
      onCopy={onCopy}
      value={result.result}
    />
  );
}

function UnitSelectors({
  currentUnits,
  fromUnit,
  onFromChange,
  onSwap,
  onToChange,
  toUnit,
}: {
  currentUnits: ReturnType<typeof getUnitsForCategory>;
  fromUnit: string;
  onFromChange: (v: string) => void;
  onSwap: () => void;
  onToChange: (v: string) => void;
  toUnit: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr]">
      <Field>
        <FieldLabel htmlFor="unit-converter-from">From</FieldLabel>
        <Select
          onValueChange={(key) => onFromChange(key as string)}
          value={fromUnit}
        >
          <SelectTrigger aria-label="From unit" id="unit-converter-from">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentUnits.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label} ({option.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="flex items-end justify-center pb-1">
        <Button
          aria-label="Swap units"
          onClick={onSwap}
          size="icon-sm"
          variant="outline"
        >
          <ArrowLeftRight className="size-4" />
        </Button>
      </div>
      <Field>
        <FieldLabel htmlFor="unit-converter-to">To</FieldLabel>
        <Select
          onValueChange={(key) => onToChange(key as string)}
          value={toUnit}
        >
          <SelectTrigger aria-label="To unit" id="unit-converter-to">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentUnits.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label} ({option.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: cohesive single-screen island, keep together
function UnitConverterPage() {
  const { trackAction } = useToolTracking('unit-converter', 'Unit Converter');
  const [state, setState] = useUnitConverterState();
  const { copiedKey, copy } = useCopyFeedback();
  const currentUnits = useMemo(
    () => getUnitsForCategory(state.category),
    [state.category]
  );
  const result = useMemo(
    () =>
      convertUnit(state.value, state.fromUnit, state.toUnit, state.category),
    [state.value, state.fromUnit, state.toUnit, state.category]
  );

  const handleCategoryChange = useCallback(
    (category: UnitCategory) => {
      const units = getUnitsForCategory(category);
      const fromUnit = units[0].id;
      const toUnit = units[1]?.id ?? units[0].id;
      setState((prev) => ({ ...prev, category, fromUnit, toUnit }));
    },
    [setState]
  );

  const handleFromChange = useCallback(
    (v: string) => {
      setState((prev) => ({ ...prev, fromUnit: v }));
    },
    [setState]
  );

  const handleToChange = useCallback(
    (v: string) => {
      setState((prev) => ({ ...prev, toUnit: v }));
    },
    [setState]
  );

  const handleValueChange = useCallback(
    (v: string) => {
      setState((prev) => ({ ...prev, value: v }));
    },
    [setState]
  );

  const handleSwap = useCallback(() => {
    setState((prev) => ({
      ...prev,
      fromUnit: prev.toUnit,
      toUnit: prev.fromUnit,
    }));
    trackAction('swap');
  }, [trackAction, setState]);

  const handleCopyResult = useCallback(async () => {
    if (
      result.isValid &&
      result.result &&
      (await copy(result.result, 'result', 'Copied result'))
    ) {
      trackAction('copy');
    }
  }, [copy, result, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () =>
      buildUnitConverterParams(
        state.value,
        state.category,
        state.fromUnit,
        state.toUnit
      ),
    trackAction
  );

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, value: '' }));
    trackAction('clear');
  }, [trackAction, setState]);

  const hasInput = state.value.trim().length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-2xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="unit-converter-category">Category</FieldLabel>
            <Select
              onValueChange={(key) => handleCategoryChange(key as UnitCategory)}
              value={state.category}
            >
              <SelectTrigger aria-label="Category" id="unit-converter-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <UnitSelectors
            currentUnits={currentUnits}
            fromUnit={state.fromUnit}
            onFromChange={handleFromChange}
            onSwap={handleSwap}
            onToChange={handleToChange}
            toUnit={state.toUnit}
          />
          <Field>
            <FieldLabel htmlFor="unit-converter-value">Value</FieldLabel>
            <Input
              aria-label="Value"
              id="unit-converter-value"
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Enter value..."
              value={state.value}
            />
          </Field>
          <div className="flex flex-col gap-2">
            <ConversionOutput
              copiedKey={copiedKey as string | null}
              hasInput={hasInput}
              onCopy={handleCopyResult}
              result={result}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton onClick={handleCopyLink} />
            <Button onClick={handleClear} size="sm" variant="outline">
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
