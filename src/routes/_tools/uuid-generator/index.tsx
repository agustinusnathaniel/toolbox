'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { buildUuidStateFromSearch } from '@/lib/tools/uuid-generator/adapters/uuid-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { useUuidPage } from './-components/use-uuid-page';
import { UuidOptionsForm } from './-components/uuid-options-form';
import { UuidHelp, UuidResults } from './-components/uuid-results';
import { meta } from './-meta';

const searchSchema = z.object({
  count: z.string().optional(),
  hyphens: z.string().optional(),
  uppercase: z.string().optional(),
  version: z.string().optional(),
});

export const Route = createFileRoute('/_tools/uuid-generator/')({
  component: UuidGeneratorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function UuidGeneratorPage() {
  const { trackAction } = useToolTracking('uuid-generator', 'UUID Generator');
  const search = useSearch({ from: '/_tools/uuid-generator/' });
  const page = useUuidPage(buildUuidStateFromSearch(search), trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <UuidOptionsForm
            clearResult={page.clearResult}
            onGenerate={page.handleGenerate}
            options={page.options}
            setOptions={page.setOptions}
          />
          <UuidResults
            copiedKey={page.copiedKey}
            onCopy={page.handleCopy}
            onCopyAll={page.handleCopyAll}
            onCopyLink={page.handleCopyLink}
            result={page.result}
          />
        </CardContent>
      </Card>
      <UuidHelp />
    </div>
  );
}
