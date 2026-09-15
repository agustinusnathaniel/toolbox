'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  TimestampDateCards,
  TimestampEpochCards,
  TimestampError,
  TimestampHelp,
  TimestampInput,
} from './-components/timestamp-sections';
import { useTimestampPage } from './-components/use-timestamp-page';
import { meta } from './-meta';

const searchSchema = z.object({
  ts: z.string().optional(),
});

export const Route = createFileRoute('/_tools/timestamp-converter/')({
  component: TimestampConverterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function TimestampConverterPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'timestamp-converter',
    'Timestamp Converter'
  );
  const search = useSearch({ from: '/_tools/timestamp-converter/' });
  const page = useTimestampPage(search.ts ?? '', trackAction, trackComplete);
  const hasInput = page.input.trim().length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <TimestampInput
        input={page.input}
        onCopyLink={page.handleCopyLink}
        onInput={page.setInput}
        onUseNow={page.handleUseNow}
      />
      {page.result.error && hasInput && (
        <TimestampError error={page.result.error} />
      )}
      {page.result.isValid && hasInput && (
        <>
          <TimestampEpochCards
            copiedKey={page.copiedKey}
            epochMillis={page.result.epochMillis}
            epochSeconds={page.result.epochSeconds}
            onCopy={page.handleCopy}
          />
          <TimestampDateCards
            copiedKey={page.copiedKey}
            iso={page.result.iso}
            local={page.result.local}
            onCopyIso={() =>
              page.handleCopy('iso', page.result.iso ?? '', 'Copied ISO 8601')
            }
            relative={page.result.relative}
            utc={page.result.utc}
          />
        </>
      )}
      <TimestampHelp />
    </div>
  );
}
