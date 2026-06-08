import { createFileRoute } from '@tanstack/react-router';

import ChangelogPage from '@/lib/pages/changelog';
import { SITE_NAME } from '@/lib/utils/metadata';

export const Route = createFileRoute('/changelog')({
  component: ChangelogPage,
  head: () => ({
    meta: [
      { title: `Changelog — ${SITE_NAME}` },
      {
        name: 'description',
        content: "What's new in Toolbox — product updates and improvements.",
      },
    ],
  }),
});
