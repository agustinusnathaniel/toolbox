'use client';

import { createFileRoute } from '@tanstack/react-router';
import { Check, Copy, FileJson } from 'lucide-react';
import { useCallback, useState } from 'react';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import type { JsonFormatterResult } from '@/lib/tools/json-formatter/adapters/json-formatter';
import {
  formatJson,
  minifyJson,
  validateJson,
} from '@/lib/tools/json-formatter/adapters/json-formatter';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

export const Route = createFileRoute('/_tools/json-formatter/')({
  component: JsonFormatterPage,
  ...createToolRouteMetadata(meta),
});

function JsonFormatterPage() {
  const { trackAction } = useToolTracking('json-formatter', 'JSON Formatter');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<JsonFormatterResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState<
    'format' | 'validate' | 'minify' | null
  >(null);

  const handleFormat = useCallback(() => {
    const res = formatJson(input);
    setResult(res);
    setActiveAction('format');
    setCopied(false);
    trackAction('format');
  }, [input, trackAction]);

  const handleValidate = useCallback(() => {
    const res = validateJson(input);
    setResult(res);
    setActiveAction('validate');
    setCopied(false);
    trackAction('validate');
  }, [input, trackAction]);

  const handleMinify = useCallback(() => {
    const res = minifyJson(input);
    setResult(res);
    setActiveAction('minify');
    setCopied(false);
    trackAction('minify');
  }, [input, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.formatted)) {
      return;
    }
    const copied = await copyToClipboard(result.formatted, 'Copied JSON');
    if (copied) {
      setCopied(true);
      trackAction('copy');
      setTimeout(() => setCopied(false), 1500);
    }
  }, [result, trackAction]);

  const actionLabel: Record<string, string> = {
    format: 'Formatted',
    minify: 'Minified',
  };
  const label = actionLabel[activeAction ?? ''] ?? 'Validated';
  const showResult = result && input.trim();
  const showError = result && !result.isValid;

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

          <div className="flex flex-wrap gap-2">
            <Button onPress={handleFormat} size="sm">
              <FileJson className="size-4" />
              Format
            </Button>
            <Button intent="outline" onPress={handleValidate} size="sm">
              Validate
            </Button>
            <Button intent="outline" onPress={handleMinify} size="sm">
              Minify
            </Button>
          </div>

          {input.trim() && !result && (
            <p className="text-muted-fg text-xs">
              Click Format, Validate, or Minify to process your JSON.
            </p>
          )}

          {showError && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">Invalid JSON</p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {showResult && result.isValid && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-fg text-sm">{label}</span>
                <Button
                  aria-label="Copy result"
                  intent="outline"
                  onPress={handleCopy}
                  size="sq-sm"
                >
                  {copied ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
                {result.formatted}
              </pre>
            </div>
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
