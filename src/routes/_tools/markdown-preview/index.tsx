'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Copy, Link } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  buildMarkdownParams,
  buildMarkdownStateFromSearch,
} from '@/lib/tools/markdown-preview/adapters/markdown-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { useMarkdownPreview } from './-components/use-markdown-preview';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/markdown-preview/')({
  component: MarkdownPreviewPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function MarkdownPreviewPage() {
  const { trackAction } = useToolTracking(
    'markdown-preview',
    'Markdown Preview'
  );
  const search = useSearch({ from: '/_tools/markdown-preview/' });
  const [input, setInput] = useState(
    () => buildMarkdownStateFromSearch(search).input
  );
  const { copiedKey, copy } = useCopyFeedback();
  const [trigger, setTrigger] = useState(0);
  const {
    computing,
    result: workerResult,
    setResult,
  } = useMarkdownPreview(input, trigger);

  useEffect(() => {
    if (input.trim()) {
      setTrigger((t) => t + 1);
    } else {
      setResult({ html: '', isEmpty: true });
    }
  }, [input, setResult]);

  const result = workerResult ?? { html: '', isEmpty: true };

  const handleCopyHtml = useCallback(async () => {
    if (result.isEmpty || !result.html) {
      return;
    }
    if (await copy(result.html, 'html', 'Copied HTML')) {
      trackAction('copy_html');
    }
  }, [copy, result.html, result.isEmpty, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildMarkdownParams(input),
    trackAction
  );

  const handleClear = useCallback(() => {
    setInput('');
    trackAction('clear');
  }, [trackAction]);

  const renderPreview = () => {
    if (computing) {
      return (
        <p aria-live="polite" className="text-muted-fg text-sm">
          Rendering…
        </p>
      );
    }
    if (result.timedOut) {
      return (
        <div
          className="rounded-lg border border-danger/30 bg-danger/5 p-3"
          role="alert"
        >
          <p className="font-medium text-danger text-sm">Rendering timed out</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
            {result.error}
          </pre>
        </div>
      );
    }
    if (result.isEmpty) {
      return (
        <p className="text-muted-fg text-sm">
          Preview will appear here once you type Markdown.
        </p>
      );
    }
    return (
      <div
        className="markdown-preview prose prose-sm max-w-none rounded-lg border bg-(--card-bg)/50 p-4 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-muted [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-muted-fg [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h1]:font-bold [&_h1]:text-2xl [&_h2]:font-bold [&_h2]:text-xl [&_h3]:font-bold [&_h3]:text-lg [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_ul]:list-disc [&_ul]:pl-6"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify before rendering
        dangerouslySetInnerHTML={{ __html: result.html }}
      />
    );
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="markdown-input">
              Markdown
            </label>
            <Textarea
              aria-label="Markdown input"
              className="min-h-60 font-mono"
              id="markdown-input"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type Markdown here... e.g. # Hello **world**"
              value={input}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              aria-label="Copy HTML"
              intent="outline"
              isDisabled={computing || result.isEmpty || !result.html}
              onPress={handleCopyHtml}
              size="sm"
            >
              {copiedKey === 'html' ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
              Copy HTML
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
            <Button
              aria-label="Clear markdown"
              intent="outline"
              onPress={handleClear}
              size="sm"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2">
          <span className="text-muted-fg text-sm">Preview</span>
          {renderPreview()}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. Rendering happens entirely in your browser using the marked library. Your Markdown never leaves your device.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'GitHub Flavored Markdown (GFM) is supported including tables, strikethrough, autolinks, and task lists.',
            question: 'What Markdown flavor is supported?',
          },
          {
            answer:
              'Click Copy link to copy a shareable URL that restores your Markdown input when opened.',
            question: 'How do I share my Markdown?',
          },
        ]}
        howItWorks={{
          description:
            'Type Markdown on the left and see the HTML preview update live. Copy the rendered HTML or share a link.',
          steps: [
            'Type or paste Markdown into the editor',
            'See the HTML preview update live',
            'Copy the rendered HTML or a shareable link',
            'Use Clear to reset the editor',
          ],
        }}
      />
    </div>
  );
}
