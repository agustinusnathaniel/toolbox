'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { ArrowUpDown, Check, Copy, Link } from 'lucide-react';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
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
import type { CsvMode } from '@/lib/tools/csv-converter/adapters/csv-converter';
import {
  buildCsvParams,
  buildCsvStateFromSearch,
} from '@/lib/tools/csv-converter/adapters/csv-params';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { useCsvConverter } from './-components/use-csv-converter';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
  mode: z.string().optional(),
});

const MODE_OPTIONS: ReadonlyArray<{ id: CsvMode; label: string }> = [
  { id: 'csv-to-json', label: 'CSV to JSON' },
  { id: 'json-to-csv', label: 'JSON to CSV' },
];

export const Route = createFileRoute('/_tools/csv-converter/')({
  component: CsvConverterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function CsvConverterPage() {
  const { trackAction } = useToolTracking('csv-converter', 'CSV Converter');
  const search = useSearch({ from: '/_tools/csv-converter/' });
  const [state, setState] = useState(() => buildCsvStateFromSearch(search));
  const [convertTrigger, setConvertTrigger] = useState(0);
  const [copied, setCopied] = useState(false);

  const { computing, result, setResult } = useCsvConverter(
    state.input,
    state.mode,
    convertTrigger
  );

  const handleModeChange = useCallback(
    (mode: CsvMode) => {
      setState((prev) => ({ ...prev, mode }));
      setResult(null);
    },
    [setResult]
  );

  const handleInputChange = useCallback(
    (input: string) => {
      setState((prev) => ({ ...prev, input }));
      setResult(null);
    },
    [setResult]
  );

  const handleConvert = useCallback(() => {
    setResult(null);
    setConvertTrigger((trigger) => trigger + 1);
    setCopied(false);
    trackAction('convert');
  }, [setResult, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copyToClipboard(result.output, 'Copied Output')) {
      setCopied(true);
      trackAction('copy');
      setTimeout(() => setCopied(false), 1500);
    }
  }, [result, trackAction]);

  const handleCopyLink = useCallback(async () => {
    const params = buildCsvParams(state);
    const url = `${window.location.origin}${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    if (await copyToClipboard(url, 'Copied Shareable Link')) {
      trackAction('copy_link');
    }
  }, [state, trackAction]);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="csv-mode">Mode</Label>
              <Select
                aria-label="Conversion mode"
                onSelectionChange={(key) => handleModeChange(key as CsvMode)}
                selectedKey={state.mode}
              >
                <SelectTrigger />
                <SelectContent items={MODE_OPTIONS}>
                  {(option) => (
                    <SelectItem id={option.id}>{option.label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button intent="primary" onPress={handleConvert} size="sm">
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

          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="csv-input">
              {state.mode === 'json-to-csv' ? 'JSON Input' : 'CSV Input'}
            </label>
            <Textarea
              aria-label="Input data"
              className="min-h-40 font-mono"
              id="csv-input"
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                state.mode === 'json-to-csv'
                  ? 'Paste your JSON here...'
                  : 'Paste your CSV here...'
              }
              value={state.input}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              aria-label="Copy output"
              intent="outline"
              isDisabled={!result?.isValid}
              onPress={handleCopy}
              size="sm"
            >
              {copied ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
              Copy output
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

          {state.input.trim() && !result && (
            <p className="text-muted-fg text-xs">
              Click Convert to{' '}
              {state.mode === 'json-to-csv'
                ? 'turn JSON into CSV'
                : 'turn CSV into JSON'}
              .
            </p>
          )}

          {result && !result.isValid && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">
                Conversion failed
              </p>
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
                Conversion timed out
              </p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {result?.isValid && result.output && (
            <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
              {result.output}
            </pre>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
