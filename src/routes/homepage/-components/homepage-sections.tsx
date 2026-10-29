import { RiGlobalLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { ArrowDownRight, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { ThemeToggle } from '@/lib/components/theme-toggle';
import { buttonVariants } from '@/lib/components/ui/button';
import {
  getToolNavItems,
  type ToolNavItem,
} from '@/lib/navigation/tool-registry';

export const sectionClass = 'mx-auto w-full max-w-7xl px-4 lg:px-6';

export const allTools = getToolNavItems();

const JSON_EXAMPLE = [
  '{',
  '  "name": "Toolbox",',
  '  "mode": "browser",',
  '  "status": "ready"',
  '}',
].join('\n');

export function HomepageHeader() {
  return (
    <header className="border-border/70 border-b bg-background">
      <div
        className={`${sectionClass} flex min-h-16 items-center justify-between gap-6`}
      >
        <Link
          aria-label="Toolbox home"
          className="flex items-center gap-2 font-semibold text-foreground no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          to="/"
        >
          <RiGlobalLine aria-hidden="true" className="size-5" />
          <span>Toolbox</span>
        </Link>
        <nav
          aria-label="Marketing navigation"
          className="flex items-center gap-2 sm:gap-5"
        >
          <a
            className="hidden rounded-md px-2 py-1.5 text-muted-foreground text-sm no-underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline"
            href="#tools"
          >
            Tools
          </a>
          <a
            className="hidden rounded-md px-2 py-1.5 text-muted-foreground text-sm no-underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline"
            href="#privacy"
          >
            Why local?
          </a>
          <ThemeToggle size="icon-sm" />
        </nav>
      </div>
    </header>
  );
}

function ShowcasePane({
  children,
  tool,
}: {
  children: ReactNode;
  tool: ToolNavItem;
}) {
  return (
    <Link
      aria-label={`${tool.title}, example`}
      className="flex min-w-0 flex-col rounded-xl border border-transparent bg-background p-4 text-foreground no-underline hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      to={tool.path}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
        >
          <span className="[&_svg]:size-4">{tool.icon}</span>
        </span>
        <h2
          className="wrap-anywhere min-w-0 flex-1 text-balance font-semibold text-foreground text-sm"
          title={tool.title}
        >
          {tool.title}
        </h2>
      </div>
      {children}
    </Link>
  );
}

export function HomepageHero({
  tools = allTools,
}: {
  tools?: Array<ToolNavItem>;
}) {
  const jsonTool = tools.find((tool) => tool.slug === 'json-formatter');
  const imageTool = tools.find((tool) => tool.slug === 'zippy-img');
  const colorTool = tools.find((tool) => tool.slug === 'color-converter');
  const hasSamples = Boolean(jsonTool || imageTool || colorTool);

  return (
    <section className="border-border/70 border-b bg-background">
      <div className={`${sectionClass} py-12 text-center sm:py-16`}>
        <h1 className="wrap-anywhere mx-auto max-w-5xl text-balance font-heading font-semibold text-5xl text-foreground sm:text-6xl lg:text-7xl">
          Small tasks.
          <br />
          Consider them handled.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
          Format JSON, compress images, and convert colors with small tools that
          open fast and stay focused.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            className={buttonVariants({ size: 'lg', variant: 'default' })}
            href="#tools"
          >
            Browse the tools
            <ArrowDownRight aria-hidden="true" />
          </a>
          <Link
            className={buttonVariants({ size: 'lg', variant: 'outline' })}
            to="/"
          >
            Open full catalog
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        {hasSamples ? (
          <div className="mx-auto mt-10 w-full max-w-5xl rounded-2xl border border-border bg-muted/40 p-2 text-left">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2">
              <p className="font-medium text-foreground text-sm">
                Example workbench
              </p>
              <p className="text-muted-foreground text-xs">
                Runs in your browser
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {jsonTool ? (
                <ShowcasePane tool={jsonTool}>
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <pre
                      className="wrap-anywhere whitespace-pre-wrap font-mono text-foreground text-xs"
                      dir="ltr"
                    >
                      <code>{JSON_EXAMPLE}</code>
                    </pre>
                  </div>
                  <p className="mt-auto text-pretty pt-3 text-muted-foreground text-sm">
                    Make messy data readable.
                  </p>
                </ShowcasePane>
              ) : null}
              {imageTool ? (
                <ShowcasePane tool={imageTool}>
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground"
                      >
                        <ImageIcon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="wrap-anywhere font-medium text-foreground text-sm">
                          photo.jpg
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Smaller file, same picture
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div
                        aria-hidden="true"
                        className="h-2 w-full rounded-full bg-secondary"
                      />
                      <div
                        aria-hidden="true"
                        className="h-2 w-2/3 rounded-full bg-primary/10"
                      />
                    </div>
                  </div>
                  <p className="mt-auto text-pretty pt-3 text-muted-foreground text-sm">
                    Lighter images, ready to share.
                  </p>
                </ShowcasePane>
              ) : null}
              {colorTool ? (
                <ShowcasePane tool={colorTool}>
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="size-11 shrink-0 rounded-md"
                        style={{ backgroundColor: '#6366F1' }}
                      />
                      <ul
                        className="wrap-anywhere min-w-0 flex-1 space-y-0.5 font-mono text-muted-foreground text-xs"
                        dir="ltr"
                      >
                        <li>HEX #6366F1</li>
                        <li>RGB 99 102 241</li>
                        <li>HSL 239 84% 67%</li>
                      </ul>
                    </div>
                  </div>
                  <p className="mt-auto text-pretty pt-3 text-muted-foreground text-sm">
                    One color, every format.
                  </p>
                </ShowcasePane>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
