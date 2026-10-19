'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  UnicodeHelp,
  UnicodeInput,
  UnicodeNormalization,
  UnicodeSummary,
  UnicodeTable,
} from './-components/unicode-sections';
import { useUnicodePage } from './-components/use-unicode-page';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/unicode-inspector/')({
  component: UnicodeInspectorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function UnicodeInspectorPage() {
  const { trackAction } = useToolTracking(
    'unicode-inspector',
    'Unicode Inspector'
  );
  const search = useSearch({ from: '/_tools/unicode-inspector/' });
  const page = useUnicodePage(search, trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <UnicodeInput
            onClear={page.handleClear}
            onCopyLink={page.handleCopyLink}
            onInput={page.handleInputChange}
            value={page.state.input}
          />
          {page.inspection && (
            <UnicodeSummary summary={page.inspection.summary} />
          )}
        </CardContent>
      </Card>
      {page.inspection && (
        <>
          <UnicodeNormalization
            changed={page.inspection.changed}
            copiedKey={page.copiedKey}
            forms={page.inspection.forms}
            onCopyForm={page.handleCopyForm}
          />
          <UnicodeTable
            total={page.inspection.chars.length}
            truncated={page.inspection.truncated}
            visible={page.inspection.visible}
          />
        </>
      )}
      <UnicodeHelp />
    </div>
  );
}
