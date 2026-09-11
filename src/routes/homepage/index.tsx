import { createFileRoute } from '@tanstack/react-router';

import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { HomepagePage } from './-components/homepage-page';

const meta = {
  description:
    'Useful browser-based tools for everyday work, with privacy considered from the start.',
  pageTitle: 'The Local Workbench - Toolbox',
  slug: 'homepage',
} as const;

export const Route = createFileRoute('/homepage/')({
  component: HomepagePage,
  ...createToolRouteMetadata(meta),
  staticData: {
    meta,
    shell: 'marketing',
  },
});
