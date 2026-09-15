import { Check } from 'lucide-react';

import { Badge } from '@/lib/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';

import { HomepagePrivacy } from './homepage-privacy';
import {
  HomepageHeader,
  HomepageHero,
  HomepageTools,
} from './homepage-sections';

const EXAMPLE_OUTPUT = [
  '{',
  '  "name": "Toolbox",',
  '  "mode": "browser",',
  '  "status": "ready"',
  '}',
].join('\n');

export function HomepagePage() {
  return (
    <div className="overflow-x-clip">
      <a
        className="sr-only z-50 rounded-lg bg-bg px-4 py-2 font-medium text-fg focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        href="#main-content"
      >
        Skip to content
      </a>
      <HomepageHeader />
      <main
        className="scroll-mt-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
        id="main-content"
        tabIndex={-1}
      >
        <HomepageHero example={<ExampleWorkbench />} />
        <HomepageTools />
        <HomepagePrivacy />
      </main>
    </div>
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
