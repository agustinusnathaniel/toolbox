'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { ArrowLeftRight, Check, Copy, Link, Trash2 } from 'lucide-react';
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
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { YamlMode } from '@/lib/tools/yaml-converter/adapters/yaml-params';
import {
  buildYamlParams,
  buildYamlStateFromSearch,
} from '@/lib/tools/yaml-converter/adapters/yaml-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { useYamlConverter } from './-components/use-yaml-converter';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
  mode: z.string().optional(),
});

const MODE_OPTIONS: ReadonlyArray<{ id: YamlMode; label: string }> = [
  { id: 'json-to-yaml', label: 'JSON to YAML' },
  { id: 'yaml-to-json', label: 'YAML to JSON' },
];

export const Route = createFileRoute('/_tools/yaml-converter/')({
  component: YamlConverterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function YamlConverterPage() {
  const { trackAction } = useToolTracking('yaml-converter', 'YAML Converter');
  const search = useSearch({ from: '/_tools/yaml-converter/' });
  const [state, setState] = useState(() => buildYamlStateFromSearch(search));
  const [convertTrigger, setConvertTrigger] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();

  const { computing, result, setResult } = useYamlConverter(
    state.input,
    state.mode,
    convertTrigger
  );

  const handleModeChange = useCallback(
    (mode: YamlMode) => {
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
    setConvertTrigger((t) => t + 1);
    trackAction('convert');
  }, [setResult, trackAction]);

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, input: '' }));
    setResult(null);
    setConvertTrigger(0);
    trackAction('clear');
  }, [setResult, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copy(result.output, 'copy', 'Copied Output')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildYamlParams(state.input, state.mode),
    trackAction
  );

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="yaml-mode">Mode</Label>
              <Select
                aria-label="Conversion mode"
                onSelectionChange={(key) => handleModeChange(key as YamlMode)}
                selectedKey={state.mode}
              >
                <SelectTrigger id="yaml-mode" />
                <SelectContent items={MODE_OPTIONS}>
                  {(option) => (
                    <SelectItem id={option.id}>{option.label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button intent="primary" onPress={handleConvert} size="sm">
                <ArrowLeftRight className="size-4" />
                Convert
              </Button>
              <Button intent="outline" onPress={handleClear} size="sm">
                <Trash2 className="size-4" />
                Clear
              </Button>
              {computing && (
                <span aria-live="polite" className="text-muted-fg text-xs">
                  Converting…
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="yaml-input">
              {state.mode === 'json-to-yaml' ? 'JSON Input' : 'YAML Input'}
            </label>
            <Textarea
              aria-label="Input data"
              className="min-h-40 font-mono"
              id="yaml-input"
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                state.mode === 'json-to-yaml'
                  ? 'Paste your JSON here...'
                  : 'Paste your YAML here...'
              }
              value={state.input}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              aria-label="Copy output"
              intent="outline"
              isDisabled={
                !(result?.isValid && result.output) || result.timedOut
              }
              onPress={handleCopy}
              size="sm"
            >
              {copiedKey === 'copy' ? (
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

          {state.input.trim() && !result && !computing && (
            <p className="text-muted-fg text-xs">
              Click Convert to{' '}
              {state.mode === 'json-to-yaml'
                ? 'turn JSON into YAML'
                : 'turn YAML into JSON'}
              .
            </p>
          )}

          {result && !result.isValid && !result.timedOut && (
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-fg text-sm">Output</span>
                <Button
                  aria-label="Copy result"
                  intent="outline"
                  onPress={handleCopy}
                  size="sq-sm"
                >
                  {copiedKey === 'copy' ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
                {result.output}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All conversion happens in your browser using js-yaml. No data is ever sent to a server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'JSON to YAML parses JSON and dumps it as YAML. YAML to JSON parses YAML and stringifies it as JSON with 2-space indentation.',
            question: 'How does the conversion work?',
          },
          {
            answer:
              'Conversions run in a Web Worker so the page stays responsive; conversions that take too long show a timeout message.',
            question: 'What is the largest input supported?',
          },
        ]}
        howItWorks={{
          description:
            'Pick a direction, paste your input, and convert. Copy the output or share a link that restores your input and mode.',
          steps: [
            'Choose JSON to YAML or YAML to JSON',
            'Paste your input into the textarea',
            'Click Convert',
            'Copy the output or copy a shareable link',
          ],
        }}
      />
    </div>
  );
}
