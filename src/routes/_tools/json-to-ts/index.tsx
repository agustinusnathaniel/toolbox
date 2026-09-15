'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  JsonToTsActions,
  JsonToTsHelp,
  JsonToTsInput,
  JsonToTsOutput,
} from './-components/json-to-ts-sections';
import { useJsonToTsPage } from './-components/use-json-to-ts-page';
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
  const page = useJsonToTsPage(search.input ?? '', trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <JsonToTsInput onInput={page.updateInput} value={page.input} />
          <JsonToTsActions
            computing={page.computing}
            onCopyLink={page.handleCopyLink}
            onGenerate={page.handleGenerate}
          />
          <JsonToTsOutput
            copied={page.copiedKey === 'copy'}
            hasInput={Boolean(page.input.trim())}
            onCopy={page.handleCopy}
            result={page.result}
          />
        </CardContent>
      </Card>
      <JsonToTsHelp />
    </div>
  );
}
