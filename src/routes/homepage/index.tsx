import { createFileRoute, useLocation } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { HomepagePage } from './-components/homepage-page';
import type { StressMode } from './-components/homepage-stress';

const meta = {
  description:
    'Small browser-based tools for everyday tasks: format JSON, compress images, and convert colors.',
  pageTitle: 'Toolbox - Small tools for everyday work',
  slug: 'homepage',
} as const;

export const Route = createFileRoute('/homepage/')({
  component: HomepageRoute,
  ...createToolRouteMetadata(meta),
  staticData: {
    meta,
    shell: 'marketing',
  },
});

const StressPreview = import.meta.env.DEV
  ? lazy(() =>
      import('./-components/homepage-stress').then((mod) => ({
        default: mod.StressHomepage,
      }))
    )
  : null;

function parseStressMode(searchStr: string): StressMode | null {
  const value = new URLSearchParams(searchStr).get('data');
  if (
    value === 'demo' ||
    value === 'worst' ||
    value === 'empty' ||
    value === 'one' ||
    value === 'large'
  ) {
    return value;
  }
  return null;
}

function HomepageRoute() {
  const searchStr = useLocation({ select: (s) => s.searchStr });
  const mode = parseStressMode(searchStr);
  if (import.meta.env.DEV && StressPreview && mode) {
    return (
      <Suspense fallback={<HomepagePage />}>
        <StressPreview mode={mode} />
      </Suspense>
    );
  }
  return <HomepagePage />;
}
