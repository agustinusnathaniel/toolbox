'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  MarkdownEditor,
  MarkdownHelp,
  MarkdownPreview,
  MarkdownToolbar,
} from './-components/markdown-sections';
import { useMarkdownPage } from './-components/use-markdown-page';
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
  const page = useMarkdownPage(search.input ?? '', trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <MarkdownEditor onInput={page.setInput} value={page.input} />
      <MarkdownToolbar
        canCopy={Boolean(page.computed.html)}
        computing={page.computing}
        copied={page.copiedKey === 'html'}
        isEmpty={page.computed.isEmpty ?? true}
        onClear={page.handleClear}
        onCopyHtml={page.handleCopyHtml}
        onCopyLink={page.handleCopyLink}
      />
      <Card>
        <CardContent className="flex flex-col gap-2">
          <span className="text-muted-fg text-sm">Preview</span>
          <MarkdownPreview
            computing={page.computing}
            error={page.computed.error}
            html={page.computed.html ?? ''}
            isEmpty={page.computed.isEmpty ?? true}
            timedOut={page.computed.timedOut}
          />
        </CardContent>
      </Card>
      <MarkdownHelp />
    </div>
  );
}
