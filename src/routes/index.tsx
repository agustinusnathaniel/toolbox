import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import { useEffect } from 'react';

import { StaggerChildren } from '@/lib/components/animations/stagger-children';
import { CardContent, CardHeader } from '@/lib/components/ui/card';
import { usePinnedTools } from '@/lib/hooks/use-pinned-tools';
import type { ToolNavItem } from '@/lib/navigation/tool-registry';
import { getToolNavItems } from '@/lib/navigation/tool-registry';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/utils/metadata';

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({
    meta: [
      { title: SITE_NAME },
      { content: SITE_DESCRIPTION, name: 'description' },
      { content: SITE_NAME, property: 'og:title' },
      { content: SITE_DESCRIPTION, property: 'og:description' },
      { content: 'website', property: 'og:type' },
      { content: '/', property: 'og:url' },
    ],
  }),
});

function HomePage() {
  const tools = getToolNavItems();
  const navigate = useNavigate();
  const { isPinned, togglePin } = usePinnedTools();

  const pinnedTools = tools.filter((tool) => isPinned(tool.slug));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const index = Number.parseInt(e.key, 10) - 1;
      if (index >= 0 && index < tools.length) {
        e.preventDefault();
        navigate({ to: tools[index].path });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, tools]);

  return (
    <div className="flex flex-col gap-y-8">
      <section className="space-y-3">
        <h1 className="text-pretty font-semibold text-2xl/8 text-fg">
          {SITE_NAME}
        </h1>
        <p className="max-w-2xl text-muted-fg">{SITE_DESCRIPTION}</p>
      </section>

      {pinnedTools.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold text-fg text-lg">Pinned</h2>
          <StaggerChildren className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pinnedTools.map((tool) => (
              <ToolCard
                isPinned={isPinned}
                key={tool.slug}
                togglePin={togglePin}
                tool={tool}
              />
            ))}
          </StaggerChildren>
        </section>
      )}

      <section className="space-y-4">
        <StaggerChildren className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <ToolCard
              isPinned={isPinned}
              key={tool.slug}
              shortcut={index + 1}
              togglePin={togglePin}
              tool={tool}
            />
          ))}
        </StaggerChildren>
      </section>
    </div>
  );
}

interface ToolCardProps {
  isPinned: (slug: string) => boolean;
  shortcut?: number;
  togglePin: (slug: string) => void;
  tool: ToolNavItem;
}

function ToolCard({ isPinned, shortcut, togglePin, tool }: ToolCardProps) {
  const pinned = isPinned(tool.slug);

  return (
    <Link
      className="group/card flex flex-col rounded-lg border p-6 no-underline transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      to={tool.path}
    >
      <div className="mb-3 text-muted-fg transition-colors group-hover/card:text-primary">
        {tool.icon}
      </div>
      <CardHeader className="gap-y-1 p-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-base/6 text-fg">{tool.title}</h2>
          <div className="flex shrink-0 items-center gap-2">
            <button
              aria-label={pinned ? `Unpin ${tool.title}` : `Pin ${tool.title}`}
              aria-pressed={pinned}
              className="cursor-pointer rounded text-muted-fg transition-colors hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePin(tool.slug);
              }}
              type="button"
            >
              {pinned ? (
                <Star className="size-4 text-amber-500" fill="currentColor" />
              ) : (
                <Star className="size-4" />
              )}
            </button>
            {shortcut !== undefined && (
              <kbd className="inline-flex size-5 items-center justify-center rounded border bg-secondary font-mono text-[10px] text-muted-fg">
                {shortcut}
              </kbd>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-muted-fg text-sm">{tool.description}</p>
      </CardContent>
    </Link>
  );
}
