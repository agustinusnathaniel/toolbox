'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { ArrowLeftRight, Link, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { CopyRow } from '@/lib/components/copy-row';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
      <p className="text-muted-fg text-xs">
        Enter a value to see the conversion.
      </p>
    );
  }
  if (!result.isValid) {
    return (
      <div
        className="rounded-lg border border-danger/30 bg-danger/5 p-3"
        role="alert"
      >
        <p className="font-medium text-danger text-sm">
          {result.error ?? 'Invalid input'}
        </p>
      </div>
    );
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
      <div className="flex flex-col gap-1">
        <Label htmlFor="unit-converter-from">From</Label>
        <Select
          aria-label="From unit"
          onSelectionChange={(key) => onFromChange(key as string)}
          selectedKey={fromUnit}
        >
          <SelectTrigger id="unit-converter-from" />
          <SelectContent items={currentUnits}>
            {(option) => (
              <SelectItem id={option.id}>
                {option.label} ({option.symbol})
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end justify-center pb-1">
        <Button
          aria-label="Swap units"
          intent="outline"
          onPress={onSwap}
          size="sq-sm"
        >
          <ArrowLeftRight className="size-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="unit-converter-to">To</Label>
        <Select
          aria-label="To unit"
          onSelectionChange={(key) => onToChange(key as string)}
          selectedKey={toUnit}
        >
          <SelectTrigger id="unit-converter-to" />
          <SelectContent items={currentUnits}>
            {(option) => (
              <SelectItem id={option.id}>
                {option.label} ({option.symbol})
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
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
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="unit-converter-category">Category</Label>
            <Select
              aria-label="Category"
              onSelectionChange={(key) =>
                handleCategoryChange(key as UnitCategory)
              }
              selectedKey={state.category}
            >
              <SelectTrigger id="unit-converter-category" />
              <SelectContent items={CATEGORY_OPTIONS}>
                {(option) => (
                  <SelectItem id={option.id}>{option.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <UnitSelectors
            currentUnits={currentUnits}
            fromUnit={state.fromUnit}
            onFromChange={handleFromChange}
            onSwap={handleSwap}
            onToChange={handleToChange}
            toUnit={state.toUnit}
          />
          <div className="flex flex-col gap-1">
            <label
              className="text-muted-fg text-sm"
              htmlFor="unit-converter-value"
            >
              Value
            </label>
            <Input
              aria-label="Value"
              id="unit-converter-value"
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Enter value..."
              value={state.value}
            />
          </div>
          <div className="flex flex-col gap-2">
            <ConversionOutput
              copiedKey={copiedKey as string | null}
              hasInput={hasInput}
              onCopy={handleCopyResult}
              result={result}
            />
          </div>
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
