'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  ChmodActions,
  ChmodExamples,
  ChmodHelp,
  ChmodOctalInput,
  ChmodOutput,
  ChmodPermissionGrid,
  ChmodSpecialBits,
  ChmodSymbolicInput,
} from './-components/chmod-calculator-sections';
import { useChmodCalculatorPage } from './-components/use-chmod-calculator-page';
import { meta } from './-meta';

const searchSchema = z.object({
  mode: z.string().optional(),
});

export const Route = createFileRoute('/_tools/chmod-calculator/')({
  component: ChmodCalculatorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function ChmodCalculatorPage() {
  const { trackAction } = useToolTracking(
    'chmod-calculator',
    'Chmod Calculator'
  );
  const search = useSearch({ from: '/_tools/chmod-calculator/' });
  const page = useChmodCalculatorPage(search, trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <ChmodPermissionGrid
            bits={page.bits}
            onTogglePermission={page.togglePermission}
          />
          <ChmodSpecialBits
            bits={page.bits}
            onToggleSpecial={page.toggleSpecial}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ChmodOctalInput
              error={page.octalError}
              onChange={page.updateOctalText}
              value={page.octalText}
            />
            <ChmodSymbolicInput
              error={page.symbolicError}
              onChange={page.updateSymbolicText}
              value={page.symbolicText}
            />
          </div>
          <ChmodExamples onSelect={page.loadExample} />
          <ChmodActions onCopyLink={page.handleCopyLink} />
          <ChmodOutput
            command={page.command}
            copiedKey={page.copiedKey}
            octal={page.octal}
            onCopy={page.handleCopy}
            symbolic={page.symbolic}
          />
        </CardContent>
      </Card>
      <ChmodHelp />
    </div>
  );
}
