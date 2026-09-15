'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  HtmlEntitiesExamples,
  HtmlEntitiesHelp,
  HtmlEntitiesInput,
  HtmlEntitiesModes,
  HtmlEntitiesOutput,
  HtmlEntitiesShare,
} from './-components/html-entities-sections';
import { useHtmlEntitiesPage } from './-components/use-html-entities-page';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
  mode: z.enum(['encode', 'decode']).optional(),
});

export const Route = createFileRoute('/_tools/html-entities/')({
  component: HtmlEntitiesPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function HtmlEntitiesPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'html-entities',
    'HTML Entity Codec'
  );
  const search = useSearch({ from: '/_tools/html-entities/' });
  const page = useHtmlEntitiesPage(search, trackAction, trackComplete);
  const resultLabel = page.state.mode === 'encode' ? 'Encoded' : 'Decoded';

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <HtmlEntitiesInput
            input={page.state.input}
            mode={page.state.mode}
            onInput={(input) => page.setState((prev) => ({ ...prev, input }))}
          />
          <HtmlEntitiesModes
            mode={page.state.mode}
            onClear={page.handleClear}
            onMode={(mode) => page.setState((prev) => ({ ...prev, mode }))}
            track={trackAction}
          />
          <HtmlEntitiesShare onCopyLink={page.handleCopyLink} />
          <HtmlEntitiesExamples
            onExample={(ex) => {
              page.setState((prev) => ({ ...prev, input: ex }));
              trackAction('example');
            }}
          />
          <HtmlEntitiesOutput
            copied={page.copiedKey === 'copy'}
            hasInput={page.state.input.trim().length > 0}
            label={resultLabel}
            onCopy={page.handleCopy}
            result={page.result}
          />
        </CardContent>
      </Card>
      <HtmlEntitiesHelp />
    </div>
  );
}
