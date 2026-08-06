import { IconGlobe, IconMoon, IconSun } from '@intentui/icons';
import { Link } from '@tanstack/react-router';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  LockKeyhole,
  MonitorSmartphone,
  Sparkles,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Badge } from '@/lib/components/ui/badge';
import { Button, buttonStyles } from '@/lib/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';

import { getHomepageData } from './homepage-data';

const sectionClass = 'mx-auto w-full max-w-7xl px-4 lg:px-6';
const EXAMPLE_OUTPUT = [
  '{',
  '  "name": "Toolbox",',
  '  "mode": "browser",',
  '  "status": "ready"',
  '}',
].join('\n');

export function HomepagePage() {
  const { featuredTools } = getHomepageData();

  return (
    <div className="overflow-x-clip">
      <a
        className="sr-only z-50 rounded-lg bg-bg px-4 py-2 font-medium text-fg focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        href="#main-content"
      >
        Skip to content
      </a>

      <header className="border-border/70 border-b bg-bg">
        <div
          className={`${sectionClass} flex min-h-16 items-center justify-between gap-6`}
        >
          <Link
            aria-label="Toolbox home"
            className="flex items-center gap-2 font-semibold text-fg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            to="/"
          >
            <IconGlobe aria-hidden="true" className="size-5" />
            <span>Toolbox</span>
          </Link>

          <nav
            aria-label="Marketing navigation"
            className="flex items-center gap-2 sm:gap-5"
          >
            <a
              className="hidden rounded-md px-2 py-1.5 text-muted-fg text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:transition-colors motion-safe:hover:text-fg sm:inline"
              href="#tools"
            >
              Tools
            </a>
            <a
              className="hidden rounded-md px-2 py-1.5 text-muted-fg text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:transition-colors motion-safe:hover:text-fg sm:inline"
              href="#privacy"
            >
              Why local?
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main
        className="scroll-mt-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
        id="main-content"
        tabIndex={-1}
      >
        <section className="border-border/70 border-b bg-muted/40">
          <div
            className={`${sectionClass} grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14`}
          >
            <div className="max-w-2xl">
              <p className="mb-5 flex items-center gap-2 font-medium text-primary-subtle-fg text-sm">
                <IconGlobe aria-hidden="true" className="size-4" />
                The Local Workbench
              </p>
              <h1 className="max-w-xl text-pretty font-semibold text-4xl/10 tracking-[-0.03em] sm:text-5xl/11">
                Useful tools.
                <br />
                <span className="text-primary-subtle-fg">
                  Private by default.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-lg/8 text-muted-fg">
                A focused bench of browser-based utilities for the small jobs
                that keep your day moving. Bring a task, leave with an answer.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  className={buttonStyles({ intent: 'primary', size: 'lg' })}
                  href="#tools"
                >
                  Browse the tools
                  <ArrowDownRight aria-hidden="true" />
                </a>
              </div>
            </div>

            <ExampleWorkbench />
          </div>
        </section>

        <section className={`${sectionClass} py-16 sm:py-20`} id="tools">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 font-medium text-primary-subtle-fg text-sm">
                On the bench
              </p>
              <h2 className="max-w-xl text-pretty font-semibold text-3xl/9 tracking-[-0.025em] sm:text-4xl/10">
                A useful starting point for everyday work.
              </h2>
            </div>
            <p className="max-w-sm text-muted-fg text-sm/6">
              Start with a few favorites, then explore the full catalog when a
              more specific job lands on your desk.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <Card
                className="p-0 motion-safe:transition-[border-color,box-shadow] motion-safe:hover:border-primary/50 motion-safe:hover:shadow-sm"
                key={tool.slug}
              >
                <Link
                  className="group flex h-full flex-col p-5 text-fg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  to={tool.path}
                >
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <span
                      aria-hidden="true"
                      className="grid size-10 place-items-center rounded-lg bg-primary-subtle text-primary-subtle-fg motion-safe:transition-[background-color,color] motion-safe:group-hover:bg-primary motion-safe:group-hover:text-primary-fg"
                    >
                      {tool.icon}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 text-muted-fg motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                    />
                  </div>
                  <h3 className="font-semibold text-fg text-lg">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-muted-fg text-sm/6">
                    {tool.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 font-medium text-primary-subtle-fg text-sm">
                    Open tool
                  </span>
                </Link>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex justify-center border-border border-t pt-8">
            <Link
              className={buttonStyles({ intent: 'outline', size: 'lg' })}
              to="/"
            >
              Explore the full catalog
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="border-border/70 border-y bg-muted/40" id="privacy">
          <div
            className={`${sectionClass} grid gap-8 py-16 sm:py-20 md:grid-cols-[0.8fr_1.2fr] md:items-start md:gap-12`}
          >
            <div>
              <p className="mb-2 font-medium text-primary-subtle-fg text-sm">
                Why local?
              </p>
              <h2 className="text-pretty font-semibold text-3xl/9 tracking-[-0.025em] sm:text-4xl/10">
                Your work stays close to where it happens.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <ValuePoint
                description="For supported tools, processing happens in your browser, so inputs can stay on your device."
                icon={<LockKeyhole aria-hidden="true" />}
                title="Browser-first"
              />
              <ValuePoint
                description="No account or upload flow is needed to open the catalog and get started."
                icon={<MonitorSmartphone aria-hidden="true" />}
                title="Ready when you are"
              />
              <ValuePoint
                description="Small, direct utilities help you copy, download, or share the result you came for."
                icon={<Sparkles aria-hidden="true" />}
                title="Less ceremony"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      intent="plain"
      onPress={() => setTheme(isDark ? 'light' : 'dark')}
      size="sq-sm"
    >
      {isDark ? (
        <IconSun aria-hidden="true" />
      ) : (
        <IconMoon aria-hidden="true" />
      )}
    </Button>
  );
}

function ExampleWorkbench() {
  return (
    <figure className="mx-auto w-full max-w-md">
      <figcaption className="sr-only">
        Static example of a formatted JSON result
      </figcaption>
      <Card className="bg-bg">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>JSON Formatter</CardTitle>
              <CardDescription>A compact, browser-first result</CardDescription>
            </div>
            <Badge intent="success">Example output</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="rounded-lg border bg-muted/40 p-3">
            <pre className="overflow-x-auto font-mono text-fg text-sm/6">
              <code>{EXAMPLE_OUTPUT}</code>
            </pre>
          </div>
          <div className="mt-4 flex items-center gap-2 text-muted-fg text-xs">
            <Check
              aria-hidden="true"
              className="size-3.5 text-success-subtle-fg"
            />
            A static example of a local result
          </div>
        </CardContent>
      </Card>
    </figure>
  );
}

interface ValuePointProps {
  description: string;
  icon: React.ReactNode;
  title: string;
}

function ValuePoint({ description, icon, title }: ValuePointProps) {
  return (
    <Card className="h-full bg-bg">
      <CardHeader>
        <div aria-hidden="true" className="mb-1 text-primary-subtle-fg">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-fg text-sm/6">{description}</p>
      </CardContent>
    </Card>
  );
}
