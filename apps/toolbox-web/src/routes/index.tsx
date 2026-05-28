import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

import { StaggerChildren } from '@/lib/components/animations/stagger-children';
import { CardContent, CardHeader } from '@/lib/components/ui/card';
import { getToolNavItems } from '@/lib/navigation/tool-registry';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/utils/metadata';

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({
    meta: [
      { title: SITE_NAME },
      { name: 'description', content: SITE_DESCRIPTION },
      { property: 'og:title', content: SITE_NAME },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: '/' },
    ],
  }),
});

function HomePage() {
  const tools = getToolNavItems();

  return (
    <div className="flex flex-col gap-y-8">
      <section className="space-y-3">
        <h1 className="text-pretty font-semibold text-2xl/8 text-fg">
          {SITE_NAME}
        </h1>
        <p className="max-w-2xl text-muted-fg">{SITE_DESCRIPTION}</p>
      </section>

      <section className="space-y-4">
        <StaggerChildren className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              className="group/card flex flex-col rounded-lg border p-6 no-underline transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              key={tool.slug}
              to={tool.path}
            >
              <div className="mb-3 text-muted-fg transition-colors group-hover/card:text-primary">
                {tool.icon}
              </div>
              <CardHeader className="gap-y-1 p-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-base/6 text-fg">
                    {tool.title}
                  </h2>
                  <ArrowRight className="size-4 text-muted-fg transition-transform group-hover/card:translate-x-1" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-fg text-sm">{tool.description}</p>
              </CardContent>
            </Link>
          ))}
        </StaggerChildren>
      </section>
    </div>
  );
}
