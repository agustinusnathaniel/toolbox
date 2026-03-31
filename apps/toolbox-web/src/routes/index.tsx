import { createFileRoute, type ToOptions } from '@tanstack/react-router';

import { Badge } from '@/lib/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';
import { Heading } from '@/lib/components/ui/heading';
import { Link } from '@/lib/components/ui/link';

export const Route = createFileRoute('/')({
  component: HomePage,
});

type ToolCard = {
  name: string;
  description: string;
  href: ToOptions['to'];
  status: string;
};

const currentTools: Array<ToolCard> = [
  {
    name: 'WA Link Helper',
    description: 'Generate WhatsApp links with pre-filled messages.',
    href: '/tools/wa-link-helper',
    status: 'Current',
  },
  {
    name: 'Zippy Image',
    description: 'Compress images securely in-browser with no server upload.',
    href: '/tools/zippy-img',
    status: 'Current',
  },
];

const upcomingTools: Array<ToolCard> = [
  {
    name: 'JS Perf Comparator',
    description: 'Compare JavaScript snippets in a controlled runtime sandbox.',
    href: '/tools/js-perf-comparator',
    status: 'Upcoming',
  },
];

function HomePage() {
  return (
    <div className="flex flex-col gap-y-8">
      <section className="space-y-3">
        <Badge intent="primary">Unified Toolbox Platform</Badge>
        <Heading level={1}>Toolbox</Heading>
        <p className="max-w-2xl text-muted-fg">
          One place for focused utility tools. Browse available tools now and
          preview what is coming next.
        </p>
      </section>

      <section className="space-y-4">
        <Heading level={2}>Current Tools</Heading>
        <div className="grid gap-4 md:grid-cols-2">
          {currentTools.map((tool) => (
            <Card key={tool.name}>
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{tool.name}</CardTitle>
                  <Badge intent="success">{tool.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-fg text-sm">{tool.description}</p>
                <Link
                  className="text-primary text-sm underline"
                  href={tool.href}
                >
                  Open Tool
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <Heading level={2}>Upcoming</Heading>
        <div className="grid gap-4 md:grid-cols-2">
          {upcomingTools.map((tool) => (
            <Card key={tool.name}>
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{tool.name}</CardTitle>
                  <Badge intent="warning">{tool.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-fg text-sm">{tool.description}</p>
                <Link
                  className="text-primary text-sm underline"
                  href={tool.href}
                >
                  View Placeholder
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
