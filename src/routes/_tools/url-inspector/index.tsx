'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  UrlInspectorActions,
  UrlInspectorHelp,
  UrlInspectorInputs,
  UrlInspectorResult,
} from './-components/url-inspector-sections';
import { useUrlInspectorPage } from './-components/use-url-inspector-page';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/url-inspector/')({
  component: UrlInspectorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function UrlInspectorPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'url-inspector',
    'URL Inspector'
  );
  const search = useSearch({ from: '/_tools/url-inspector/' });
  const { copiedKey, handleCopyLink, handleCopyPart, result, setState, state } =
    useUrlInspectorPage(search, trackAction, trackComplete);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <UrlInspectorInputs
            input={state.input}
            onInput={(input) => setState((prev) => ({ ...prev, input }))}
          />
          <UrlInspectorActions onCopyLink={handleCopyLink} />
          <UrlInspectorResult
            copiedKey={copiedKey}
            onCopyPart={handleCopyPart}
            result={result}
          />
        </CardContent>
      </Card>
      <UrlInspectorHelp />
    </div>
  );
}
