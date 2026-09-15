import { LockKeyhole, MonitorSmartphone, Sparkles } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';

export function HomepagePrivacy() {
  return (
    <section className="border-border/70 border-y bg-muted/40" id="privacy">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:py-20 md:grid-cols-[0.8fr_1.2fr] md:items-start md:gap-12 lg:px-6">
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
  );
}

function ValuePoint({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
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
