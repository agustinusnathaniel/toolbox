'use client';

import { useLocation } from '@tanstack/react-router';

/**
 * Dev-only toggle between demo and worst-case navigation data. Mirrors the
 * homepage stress harness (`?data=` states): the sidebar and command palette
 * read worst-case tool names/descriptions when `?data=worst` is present so
 * the shell can be broken on purpose. Never rendered in production.
 */
export function DevDataToggle() {
  // Subscribe to navigation so toggling the query re-renders; read the raw
  // query string since validated route search types don't cover `data`.
  const { href, pathname } = useLocation({
    select: (s) => ({ href: s.href, pathname: s.pathname }),
  });
  const params = new URLSearchParams(href.split('?')[1] ?? '');
  const active = params.get('data') === 'worst';

  const hrefFor = (mode: 'demo' | 'worst') => {
    const next = new URLSearchParams(href.split('?')[1] ?? '');
    if (mode === 'demo') {
      next.delete('data');
    } else {
      next.set('data', mode);
    }
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <nav
      aria-label="Navigation data preview"
      className="fixed bottom-20 left-1/2 z-40 w-max max-w-[calc(100vw-1rem)] -translate-x-1/2 md:bottom-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs shadow">
        <span className="px-2 py-1 text-muted-foreground">Nav data:</span>
        {(
          [
            { label: 'Demo data', mode: 'demo' },
            { label: 'Worst case', mode: 'worst' },
          ] as const
        ).map(({ label, mode }) => {
          const isActive = mode === 'demo' ? !active : active;
          return (
            <a
              aria-current={isActive ? 'page' : undefined}
              className="rounded-full px-2 py-1 text-muted-foreground no-underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-secondary aria-[current=page]:font-medium aria-[current=page]:text-foreground"
              href={hrefFor(mode)}
              key={mode}
            >
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
