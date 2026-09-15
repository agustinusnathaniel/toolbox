'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  JsonActions,
  JsonHelp,
  JsonInput,
  JsonOutput,
} from './-components/json-sections';
import { useJsonPage } from './-components/use-json-page';
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
  const page = useJsonPage(search.input ?? '', trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <JsonInput onInput={page.updateInput} value={page.input} />
          <JsonActions
            computing={page.computing}
            onCopyLink={page.handleCopyLink}
            onRun={page.runAction}
          />
          <JsonOutput
            activeAction={page.activeAction}
            computing={page.computing}
            copied={page.copiedKey === 'copy'}
            hasInput={Boolean(page.input.trim())}
            onCopy={page.handleCopy}
            result={page.result}
          />
        </CardContent>
      </Card>
      <JsonHelp />
    </div>
  );
}
