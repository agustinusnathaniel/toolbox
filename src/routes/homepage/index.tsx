import { createFileRoute } from '@tanstack/react-router';

import { siteUrl } from '@/lib/utils/metadata';

import { HomepagePage } from './-components/homepage-page';

const meta = {
  description:
    'Useful browser-based tools for everyday work, with privacy considered from the start.',
  pageTitle: 'The Local Workbench - Toolbox',
  slug: 'homepage',
} as const;

export const Route = createFileRoute('/homepage/')({
  component: HomepagePage,
  head: () => ({
    links: [{ href: siteUrl('/homepage'), rel: 'canonical' }],
    meta: [
      { title: meta.pageTitle },
      { content: meta.description, name: 'description' },
      { content: meta.pageTitle, property: 'og:title' },
      { content: meta.description, property: 'og:description' },
      { content: 'website', property: 'og:type' },
      { content: siteUrl('/homepage'), property: 'og:url' },
      { content: siteUrl('/logo512.png'), property: 'og:image' },
      { content: 'Toolbox logo', property: 'og:image:alt' },
      { content: 'summary_large_image', name: 'twitter:card' },
      { content: meta.pageTitle, name: 'twitter:title' },
      { content: meta.description, name: 'twitter:description' },
      { content: siteUrl('/logo512.png'), name: 'twitter:image' },
      { content: 'Toolbox logo', name: 'twitter:image:alt' },
    ],
  }),
  staticData: {
    meta,
    shell: 'marketing',
  },
});
