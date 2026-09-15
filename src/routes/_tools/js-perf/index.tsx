'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { ComparisonResults } from './-components/comparison-results';
import { JsPerfHelp } from './-components/js-perf-sections';
import { JsPerfConfig, JsPerfWorkspace } from './-components/js-perf-workspace';
import { useJsPerfPage } from './-components/use-js-perf-page';
import { meta } from './-meta';

const searchSchema = z.object({
  codeA: z.string().optional(),
  codeB: z.string().optional(),
  iterations: z.string().optional(),
  preset: z.string().optional(),
  setupA: z.string().optional(),
  setupB: z.string().optional(),
  stabilityMode: z.string().optional(),
  stabilityRounds: z.string().optional(),
  teardownA: z.string().optional(),
  teardownB: z.string().optional(),
});

export const Route = createFileRoute('/_tools/js-perf/')({
  component: JsPerfComparatorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function JsPerfComparatorPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'js-perf',
    'JS Perf Comparator'
  );
  const search = useSearch({ from: '/_tools/js-perf/' });
  const page = useJsPerfPage(search, trackAction, trackComplete);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader
          description="Compare execution behavior of two JavaScript snippets using parallel sandboxed QuickJS runtimes."
          title="JS Performance Comparator"
        />
        <CardContent className="flex flex-col gap-3 md:gap-4">
          <JsPerfConfig page={page} />
          <JsPerfWorkspace
            page={page}
            trackRun={() => {
              trackAction('run');
              page.runner.run();
            }}
          />
        </CardContent>
      </Card>
      <ComparisonResults
        resultA={page.runner.resultA}
        resultB={page.runner.resultB}
        runState={page.runner.runState}
      />
      <JsPerfHelp />
    </div>
  );
}
