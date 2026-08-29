'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Copy, FileText, Link, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Label } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
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

import { useSqlFormatter } from './-components/use-sql-formatter';
import { meta } from './-meta';

const searchSchema = z.object({
  action: z.string().optional(),
  dialect: z.string().optional(),
  input: z.string().optional(),
});

const DIALECT_OPTIONS: ReadonlyArray<{ id: SqlDialect; label: string }> = [
  { id: 'sql', label: 'SQL (Generic)' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'sqlite', label: 'SQLite' },
  { id: 'bigquery', label: 'BigQuery' },
  { id: 'transactsql', label: 'Transact-SQL' },
];

const ACTION_OPTIONS: ReadonlyArray<{ id: SqlSearchAction; label: string }> = [
  { id: 'format', label: 'Format' },
  { id: 'minify', label: 'Minify' },
];

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="sql-dialect">Dialect</Label>
              <Select
                aria-label="SQL dialect"
                onSelectionChange={(key) =>
                  handleDialectChange(key as SqlDialect)
                }
                selectedKey={state.dialect}
              >
                <SelectTrigger id="sql-dialect" />
                <SelectContent items={DIALECT_OPTIONS}>
                  {(option) => (
                    <SelectItem id={option.id}>{option.label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="sql-action">Action</Label>
              <Select
                aria-label="Format action"
                onSelectionChange={(key) =>
                  handleActionChange(key as SqlSearchAction)
                }
                selectedKey={state.action}
              >
                <SelectTrigger id="sql-action" />
                <SelectContent items={ACTION_OPTIONS}>
                  {(option) => (
                    <SelectItem id={option.id}>{option.label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button intent="primary" onPress={handleFormat} size="sm">
                <FileText className="size-4" />
                {state.action === 'minify' ? 'Minify' : 'Format'}
              </Button>
              <Button intent="outline" onPress={handleClear} size="sm">
                <Trash2 className="size-4" />
                Clear
              </Button>
              {computing && (
                <span aria-live="polite" className="text-muted-fg text-xs">
                  Formatting…
                </span>
              )}
            </div>
          </div>

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

          <div className="flex flex-wrap gap-2">
            <Button
              aria-label="Copy output"
              intent="outline"
              isDisabled={
                !(result?.isValid && result.formatted) || result.timedOut
              }
              onPress={handleCopy}
              size="sm"
            >
              {copiedKey === 'copy' ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
              Copy output
            </Button>
            <Button
              aria-label="Copy shareable link"
              intent="outline"
              onPress={handleCopyLink}
              size="sm"
            >
              <Link className="size-4" />
              Copy link
            </Button>
          </div>

          {state.input.trim() && !result && !computing && (
            <p className="text-muted-fg text-xs">
              Click {state.action === 'minify' ? 'Minify' : 'Format'} to{' '}
              {state.action === 'minify'
                ? 'compress your SQL'
                : 'beautify your SQL'}
              .
            </p>
          )}

          {result && !result.isValid && !result.timedOut && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">
                Formatting failed
              </p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {result?.timedOut && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">
                Formatting timed out
              </p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {result?.isValid && result.formatted && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-fg text-sm">Output</span>
                <Button
                  aria-label="Copy result"
                  intent="outline"
                  onPress={handleCopy}
                  size="sq-sm"
                >
                  {copiedKey === 'copy' ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
                {result.formatted}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All formatting happens in your browser using sql-formatter. No data is ever sent to a server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'Supported dialects: Generic SQL, MySQL, PostgreSQL, SQLite, BigQuery, and Transact-SQL. Pick the one closest to your database.',
            question: 'Which SQL dialects are supported?',
          },
          {
            answer:
              'Use Copy link to get a shareable URL that restores your input, dialect, and action for anyone who opens it.',
            question: 'How do shareable links work?',
          },
        ]}
        howItWorks={{
          description:
            'Choose a dialect and action, paste your SQL, and format. Copy the output or share a link that restores your input and settings.',
          steps: [
            'Select a SQL dialect',
            'Choose Format or Minify',
            'Paste your SQL into the textarea',
            'Click Format or Minify',
            'Copy the output or copy a shareable link',
          ],
        }}
      />
    </div>
  );
}
