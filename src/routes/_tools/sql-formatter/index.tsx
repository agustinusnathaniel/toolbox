'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { SqlDialect } from '@/lib/tools/sql-formatter/adapters/sql-formatter';
import type { SqlSearchAction } from '@/lib/tools/sql-formatter/adapters/sql-params';
import {
  buildSqlParams,
  buildSqlStateFromSearch,
} from '@/lib/tools/sql-formatter/adapters/sql-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { SqlFormatControls } from './-components/sql-format-controls';
import { SqlHelp } from './-components/sql-help';
import { SqlResultView } from './-components/sql-result-view';
import { useSqlFormatter } from './-components/use-sql-formatter';
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
  const [state, setState] = useState(() => buildSqlStateFromSearch(search));
  const [formatTrigger, setFormatTrigger] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();

  const { computing, result, setResult } = useSqlFormatter(
    state.input,
    state.dialect,
    state.action,
    formatTrigger
  );

  const handleDialectChange = useCallback(
    (dialect: SqlDialect) => {
      setState((prev) => ({ ...prev, dialect }));
      setResult(null);
    },
    [setResult]
  );

  const handleActionChange = useCallback(
    (action: SqlSearchAction) => {
      setState((prev) => ({ ...prev, action }));
      setResult(null);
    },
    [setResult]
  );

  const handleInputChange = useCallback(
    (input: string) => {
      setState((prev) => ({ ...prev, input }));
      setResult(null);
    },
    [setResult]
  );

  const handleFormat = useCallback(() => {
    setResult(null);
    setFormatTrigger((t) => t + 1);
    trackAction(state.action);
  }, [setResult, state.action, trackAction]);

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, input: '' }));
    setResult(null);
    setFormatTrigger(0);
    trackAction('clear');
  }, [setResult, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.formatted)) {
      return;
    }
    if (await copy(result.formatted, 'copy', 'Copied SQL')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildSqlParams(state.input, state.dialect, state.action),
    trackAction
  );

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <SqlFormatControls
            action={state.action}
            computing={computing}
            dialect={state.dialect}
            onActionChange={handleActionChange}
            onClear={handleClear}
            onDialectChange={handleDialectChange}
            onFormat={handleFormat}
          />

          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="sql-input">
              SQL Input
            </label>
            <Textarea
              aria-label="SQL input"
              className="min-h-40 font-mono"
              id="sql-input"
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your SQL here... e.g. SELECT * FROM users WHERE id = 1"
              value={state.input}
            />
          </div>

          <SqlResultView
            action={state.action}
            computing={computing}
            copiedKey={copiedKey}
            input={state.input}
            onCopy={handleCopy}
            onCopyLink={handleCopyLink}
            result={result}
          />
        </CardContent>
      </Card>

      <SqlHelp />
    </div>
  );
}
