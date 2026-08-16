'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Braces, Check, Copy, Link } from 'lucide-react';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import type { JsonToTsResult } from '@/lib/tools/json-to-ts/adapters/json-to-ts';
import { jsonToTypescript } from '@/lib/tools/json-to-ts/adapters/json-to-ts';
import {
  buildJsonToTsParams,
  buildJsonToTsStateFromSearch,
} from '@/lib/tools/json-to-ts/adapters/json-to-ts-params';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/json-to-ts/')({
  component: JsonToTsPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function JsonToTsPage() {
  const { trackAction } = useToolTracking('json-to-ts', 'JSON to TypeScript');
  const search = useSearch({ from: '/_tools/json-to-ts/' });
  const [input, setInput] = useState(buildJsonToTsStateFromSearch(search));
  const [result, setResult] = useState<JsonToTsResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const res = jsonToTypescript(input);
    setResult(res);
    setCopied(false);
    trackAction('generate');
  }, [input, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    const copied = await copyToClipboard(result.output, 'Copied TypeScript');
    if (copied) {
      setCopied(true);
      trackAction('copy');
      setTimeout(() => setCopied(false), 1500);
    }
  }, [result, trackAction]);

  const handleCopyLink = useCallback(async () => {
    const params = buildJsonToTsParams(input);
    const url = `${window.location.origin}${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    if (await copyToClipboard(url, 'Copied Shareable Link')) {
      trackAction('copy_link');
    }
  }, [input, trackAction]);

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
            <Button onPress={handleGenerate} size="sm">
              <Braces className="size-4" />
              Generate
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

          {input.trim() && !result && (
            <p className="text-muted-fg text-xs">
              Click Generate to turn JSON into TypeScript interfaces.
            </p>
          )}

          {showError && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">
                Invalid JSON or shape
              </p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {showResult && result.isValid && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-fg text-sm">
                  Generated interfaces
                </span>
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
              'Yes. TypeScript generation uses native JSON.parse in your browser. No data is ever sent to a server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'Objects are named from their property key in PascalCase (user → User). Arrays of objects use a singularized key (users → User). Collisions get a numeric suffix (User, User2).',
            question: 'How are interface names chosen?',
          },
        ]}
        howItWorks={{
          description:
            'Paste a JSON sample (for example an API response) and click Generate to get TypeScript interfaces you can paste into your project.',
          steps: [
            'Paste JSON into the textarea',
            'Click Generate to build interfaces',
            'Nested objects become their own interfaces',
            'Copy the result with the copy button',
            'Share a link that restores your input',
          ],
        }}
      />
    </div>
  );
}
