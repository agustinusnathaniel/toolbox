'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { UaHelp, UaInput, UaResultCards } from './-components/ua-sections';
import { useUaPage } from './-components/use-ua-page';
import { meta } from './-meta';

const searchSchema = z.object({
  ua: z.string().optional(),
});

export const Route = createFileRoute('/_tools/ua-check/')({
  component: UACheckPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function UACheckPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'ua-check',
    'UA Check'
  );
  const search = useSearch({ from: '/_tools/ua-check/' });
  const page = useUaPage(search.ua, trackAction, trackComplete);
  const hasInput = page.uaInput.trim().length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <UaInput
        onChange={page.setUaInput}
        onCopyLink={page.handleCopyLink}
        onUseMine={page.handleUseMyUA}
        value={page.uaInput}
      />
      {hasInput && <UaResultCards result={page.result} />}
      <UaHelp />
    </div>
  );
}
