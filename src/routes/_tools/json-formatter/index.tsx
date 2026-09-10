'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { FileJson } from 'lucide-react';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { buildJsonParams } from '@/lib/tools/json-formatter/adapters/json-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { useJsonFormatter } from './-components/use-json-formatter';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/json-formatter/')({
  component: JsonFormatterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function JsonFormatterPage() {
  const { trackAction } = useToolTracking('json-formatter', 'JSON Formatter');
  const search = useSearch({ from: '/_tools/json-formatter/' });
  const [input, setInput] = useState(search.input ?? '');
  const { copiedKey, copy } = useCopyFeedback();
  const [activeAction, setActiveAction] = useState<
    'format' | 'validate' | 'minify' | null
  >(null);
  const [trigger, setTrigger] = useState(0);
  const { computing, result, setResult } = useJsonFormatter(
    input,
    activeAction,
    trigger
  );

  const handleFormat = useCallback(() => {
    setResult(null);
    setActiveAction('format');
    setTrigger((t) => t + 1);
    trackAction('format');
  }, [setResult, trackAction]);

  const handleValidate = useCallback(() => {
    setResult(null);
    setActiveAction('validate');
    setTrigger((t) => t + 1);
    trackAction('validate');
  }, [setResult, trackAction]);

  const handleMinify = useCallback(() => {
    setResult(null);
    setActiveAction('minify');
    setTrigger((t) => t + 1);
    trackAction('minify');
  }, [setResult, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.formatted)) {
      return;
    }
    if (await copy(result.formatted, 'copy', 'Copied JSON')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildJsonParams(input),
    trackAction
  );

  const actionLabel: Record<string, string> = {
    format: 'Formatted',
    minify: 'Minified',
  };
  const label = actionLabel[activeAction ?? ''] ?? 'Validated';
  const showResult = Boolean(
    result && input.trim() && !result.timedOut && result.isValid
  );
  const showError = Boolean(result && !result.isValid);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="json-input">
              JSON Input
            </label>
            <textarea
              className="field-sizing-content min-h-40 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
              id="json-input"
              onChange={(e) => {
                setInput(e.target.value);
                setResult(null);
              }}
              placeholder="Paste your JSON here..."
              value={input}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button isDisabled={computing} onPress={handleFormat} size="sm">
              <FileJson className="size-4" />
              Format
            </Button>
            <Button
              intent="outline"
              isDisabled={computing}
              onPress={handleValidate}
              size="sm"
            >
              Validate
            </Button>
            <Button
              intent="outline"
              isDisabled={computing}
              onPress={handleMinify}
              size="sm"
            >
              Minify
            </Button>
            {computing && (
              <span aria-live="polite" className="text-muted-fg text-xs">
                Processing…
              </span>
            )}
            <CopyLinkButton
              label="Copy shareable link"
              onPress={handleCopyLink}
            />
          </div>

          {input.trim() && !result && !computing && (
            <p className="text-muted-fg text-xs">
              Click Format, Validate, or Minify to process your JSON.
            </p>
          )}

          {showError && result && (
            <ToolError message={result.error} title="Invalid JSON" />
          )}

          {result?.timedOut && result && (
            <ToolError message={result.error} title="Formatting timed out" />
          )}

          {showResult && result && (
            <ResultPanel
              copied={copiedKey === 'copy'}
              label={label}
              onCopy={handleCopy}
              value={result.formatted}
            />
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All processing uses native JSON.parse and JSON.stringify in your browser. No data is ever sent to a server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'Format adds indentation (2 spaces) to make JSON readable. Validate checks if JSON is valid and normalizes it. Minify removes all unnecessary whitespace to reduce size.',
            question:
              'What is the difference between Format, Validate, and Minify?',
          },
        ]}
        howItWorks={{
          description:
            'Paste your JSON into the input area, then click Format, Validate, or Minify.',
          steps: [
            'Paste JSON into the textarea',
            'Click Format to pretty-print with indentation',
            'Click Validate to check syntax and normalize',
            'Click Minify to compress by removing whitespace',
            'Copy the result with the copy button',
          ],
        }}
      />
    </div>
  );
}
