'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  CsvActions,
  CsvHelp,
  CsvInput,
  CsvOutput,
  CsvToolbar,
} from './-components/csv-sections';
import { useCsvPage } from './-components/use-csv-page';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
  mode: z.string().optional(),
});

export const Route = createFileRoute('/_tools/csv-converter/')({
  component: CsvConverterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function CsvConverterPage() {
  const { trackAction } = useToolTracking('csv-converter', 'CSV Converter');
  const search = useSearch({ from: '/_tools/csv-converter/' });
  const page = useCsvPage(search, trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <CsvToolbar
            computing={page.computing}
            mode={page.state.mode}
            onConvert={page.handleConvert}
            onModeChange={page.handleModeChange}
          />
          <CsvInput
            input={page.state.input}
            mode={page.state.mode}
            onInput={page.handleInputChange}
          />
          <CsvActions
            canCopy={Boolean(page.result?.isValid && !page.result?.timedOut)}
            copied={page.copiedKey === 'copy'}
            onCopy={page.handleCopy}
            onCopyLink={page.handleCopyLink}
          />
          <CsvOutput
            hasInput={Boolean(page.state.input.trim())}
            mode={page.state.mode}
            result={page.result}
          />
        </CardContent>
      </Card>
      <CsvHelp />
    </div>
  );
}
