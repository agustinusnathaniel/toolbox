import { twMerge } from 'tailwind-merge';

import { Badge } from '@/lib/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';
import { Heading } from '@/lib/components/ui/heading';
import { Text } from '@/lib/components/ui/text';

import { type ChangelogTag, getChangelogEntries } from './entries';

const TAG_LABEL: Record<ChangelogTag, string> = {
  fixed: 'Fixed',
  improved: 'Improved',
  new: 'New',
};

const TAG_INTENT: Record<ChangelogTag, 'success' | 'info' | 'warning'> = {
  fixed: 'warning',
  improved: 'info',
  new: 'success',
};

const TAG_BORDER: Record<ChangelogTag, string> = {
  fixed: 'border-l-warning',
  improved: 'border-l-info',
  new: 'border-l-success',
};

const entries = getChangelogEntries();

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ChangelogPage() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6">
      <section className="space-y-2">
        <Heading level={1}>Changelog</Heading>
        <Text>What's new in Toolbox</Text>
      </section>

      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <Card
            className={twMerge('border-l-4', TAG_BORDER[entry.tag])}
            key={entry.slug}
          >
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge intent={TAG_INTENT[entry.tag]}>
                  {TAG_LABEL[entry.tag]}
                </Badge>
                <span className="text-muted-fg text-sm">
                  v{entry.version} · {formatDate(entry.date)}
                </span>
              </div>
              <CardTitle className="text-lg sm:text-xl">
                {entry.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-fg text-sm leading-relaxed [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-base [&_h3]:text-fg [&_li]:mb-1 [&_li]:ml-4 [&_p]:mb-3 [&_p]:last:mb-0 [&_strong]:font-medium [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-1">
                <entry.content />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
