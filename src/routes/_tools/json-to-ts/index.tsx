'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Braces } from 'lucide-react';
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
import { buildJsonToTsParams } from '@/lib/tools/json-to-ts/adapters/json-to-ts-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { useJsonToTs } from './-components/use-json-to-ts';
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
  const [input, setInput] = useState(search.input ?? '');
  const [generateTrigger, setGenerateTrigger] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();
  const { computing, result, setResult } = useJsonToTs(input, generateTrigger);

  const handleGenerate = useCallback(() => {
    setResult(null);
    setGenerateTrigger((trigger) => trigger + 1);
    trackAction('generate');
  }, [setResult, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copy(result.output, 'copy', 'Copied TypeScript')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildJsonToTsParams(input),
    trackAction
  );

  const showResult = result && input.trim() && !result.timedOut;
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

          <div className="flex flex-wrap items-center gap-2">
            <Button onPress={handleGenerate} size="sm">
              <Braces className="size-4" />
              Generate
            </Button>
            {computing && (
              <span aria-live="polite" className="text-muted-fg text-xs">
                Generating…
              </span>
            )}
            <CopyLinkButton
              label="Copy shareable link"
              onPress={handleCopyLink}
            />
          </div>

          {input.trim() && !result && (
            <p className="text-muted-fg text-xs">
              Click Generate to turn JSON into TypeScript interfaces.
            </p>
          )}

          {showError && (
            <ToolError message={result.error} title="Invalid JSON or shape" />
          )}

          {result?.timedOut && (
            <ToolError message={result.error} title="Generation timed out" />
          )}

          {showResult && result.isValid && (
            <ResultPanel
              copied={copiedKey === 'copy'}
              label="Generated interfaces"
              onCopy={handleCopy}
              value={result.output}
            />
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
