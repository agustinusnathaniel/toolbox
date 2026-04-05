import { createFileRoute, Link, type ToOptions } from '@tanstack/react-router';
import {
  ArrowRight,
  CalendarIcon,
  Link2Icon,
  QrCodeIcon,
  ScanIcon,
  ZapIcon,
} from 'lucide-react';

import { CardContent, CardHeader } from '@/lib/components/ui/card';
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

type ToolCard = {
  name: string;
  description: string;
  href: ToOptions['to'];
  icon: React.ReactNode;
};

const tools: Array<ToolCard> = [
  {
    name: 'WA Link Helper',
    description: 'Generate WhatsApp links with pre-filled messages.',
    href: '/tools/wa-link-helper',
    icon: <Link2Icon className="size-6" />,
  },
  {
    name: 'Zippy Image',
    description: 'Compress images securely in-browser with no server upload.',
    href: '/tools/zippy-img',
    icon: <ScanIcon className="size-6" />,
  },
  {
    name: 'UA Check',
    description: 'Check your browser and device user agent information.',
    href: '/tools/ua-check',
    icon: <QrCodeIcon className="size-6" />,
  },
  {
    name: 'QR Code Generator',
    description: 'Generate QR codes for URLs or vCard contact information.',
    href: '/tools/qrcode-generator',
    icon: <QrCodeIcon className="size-6" />,
  },
  {
    name: 'JS Perf Comparator',
    description: 'Compare JavaScript snippets in a controlled runtime sandbox.',
    href: '/tools/js-perf-comparator',
    icon: <ZapIcon className="size-6" />,
  },
  {
    name: 'Add to Calendar',
    description: 'Generate Add to Calendar links for Google Calendar events.',
    href: '/tools/add-to-calendar',
    icon: <CalendarIcon className="size-6" />,
  },
];

function HomePage() {
  return (
    <div className="flex flex-col gap-y-8">
      <section className="space-y-3">
        <h1 className="text-pretty font-semibold text-2xl/8 text-fg">
          {SITE_NAME}
        </h1>
        <p className="max-w-2xl text-muted-fg">{SITE_DESCRIPTION}</p>
      </section>

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              className="group/card flex flex-col rounded-lg border p-6 no-underline transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              key={tool.name}
              to={tool.href}
            >
              <div className="mb-3 text-muted-fg transition-colors group-hover/card:text-primary">
                {tool.icon}
              </div>
              <CardHeader className="gap-y-1 p-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-base/6 text-fg">
                    {tool.name}
                  </h2>
                  <ArrowRight className="size-4 text-muted-fg transition-transform group-hover/card:translate-x-1" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-fg text-sm">{tool.description}</p>
              </CardContent>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
