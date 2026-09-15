'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { SqlFormatControls } from './-components/sql-format-controls';
import { SqlHelp } from './-components/sql-help';
import { SqlResultView } from './-components/sql-result-view';
import { useSqlPage } from './-components/use-sql-page';
import { meta } from './-meta';

const searchSchema = z.object({
  action: z.string().optional(),
  dialect: z.string().optional(),
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/sql-formatter/')({
  component: SqlFormatterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function SqlFormatterPage() {
  const { trackAction } = useToolTracking('sql-formatter', 'SQL Formatter');
  const search = useSearch({ from: '/_tools/sql-formatter/' });
  const page = useSqlPage(search, trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <SqlFormatControls
            action={page.state.action}
            computing={page.computing}
            dialect={page.state.dialect}
            onActionChange={page.handleActionChange}
            onClear={page.handleClear}
            onDialectChange={page.handleDialectChange}
            onFormat={page.handleFormat}
          />
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="sql-input">
              SQL Input
            </label>
            <Textarea
              aria-label="SQL input"
              className="min-h-40 font-mono"
              id="sql-input"
              onChange={(e) => page.handleInputChange(e.target.value)}
              placeholder="Paste your SQL here... e.g. SELECT * FROM users WHERE id = 1"
              value={page.state.input}
            />
          </div>
          <SqlResultView
            action={page.state.action}
            computing={page.computing}
            copiedKey={page.copiedKey}
            input={page.state.input}
            onCopy={page.handleCopy}
            onCopyLink={page.handleCopyLink}
            result={page.result}
          />
        </CardContent>
      </Card>
      <SqlHelp />
    </div>
  );
}
