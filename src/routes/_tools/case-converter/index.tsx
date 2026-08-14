'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Copy, Link as LinkIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import type { CaseFormat } from '@/lib/tools/case-converter/adapters/case-converter';
import { convertCase } from '@/lib/tools/case-converter/adapters/case-converter';
import {
  buildCaseParams,
  buildCaseStateFromSearch,
} from '@/lib/tools/case-converter/adapters/case-params';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
});

const FORMAT_OPTIONS: ReadonlyArray<{ key: CaseFormat; label: string }> = [
  { key: 'camel', label: 'camelCase' },
  { key: 'pascal', label: 'PascalCase' },
  { key: 'snake', label: 'snake_case' },
  { key: 'kebab', label: 'kebab-case' },
  { key: 'screamingSnake', label: 'SCREAMING_SNAKE' },
  { key: 'title', label: 'Title Case' },
  { key: 'lower', label: 'lower case' },
  { key: 'upper', label: 'UPPER CASE' },
];

export const Route = createFileRoute('/_tools/case-converter/')({
  component: CaseConverterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

interface CopyRowProps {
  copied?: boolean;
  copyLabel?: string;
  label: string;
  mono?: boolean;
  onCopy?: () => void;
  value: string | undefined;
}

const CopyRow = ({
  copied,
  copyLabel,
  label,
  mono,
  onCopy,
  value,
}: CopyRowProps) => {
  if (!value) {
    return null;
  }
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-muted-fg text-sm">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`break-all text-right font-medium text-sm ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value}
        </span>
        {onCopy && copyLabel && (
          <Button
            aria-label={copyLabel}
            intent="outline"
            onPress={onCopy}
            size="sq-sm"
          >
            {copied ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

function CaseConverterPage() {
  const { trackAction } = useToolTracking('case-converter', 'Case Converter');
  const search = useSearch({ from: '/_tools/case-converter/' });
  const [input, setInput] = useState(
    () => buildCaseStateFromSearch(search).input
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const result = useMemo(() => convertCase(input), [input]);

  const handleCopy = useCallback(
    async (key: string, value: string, label: string) => {
      if (await copyToClipboard(value, label)) {
        setCopiedKey(key);
        trackAction('copy');
        setTimeout(() => setCopiedKey(null), 1500);
      }
    },
    [trackAction]
  );

  const handleCopyLink = useCallback(async () => {
    const params = buildCaseParams(input);
    const url = `${window.location.origin}${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    if (await copyToClipboard(url, 'Copied Shareable Link')) {
      trackAction('copy_link');
    }
  }, [input, trackAction]);

  const hasInput = input.trim().length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="case-input">
              Input text
            </label>
            <Textarea
              aria-label="Input text"
              className="min-h-40 font-mono"
              id="case-input"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste text to convert..."
              value={input}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button intent="outline" onPress={handleCopyLink} size="sm">
              <LinkIcon className="size-4" />
              Copy link
            </Button>
          </div>

          {!hasInput && (
            <p className="text-muted-fg text-xs">
              Type or paste text to see all case variants.
            </p>
          )}
        </CardContent>
      </Card>

      {result.isValid && hasInput && (
        <Card>
          <CardHeader title="Results" />
          <CardContent className="flex flex-col">
            {FORMAT_OPTIONS.map(({ key, label }) => (
              <CopyRow
                copied={copiedKey === key}
                copyLabel={`Copy ${label}`}
                key={key}
                label={label}
                mono
                onCopy={() =>
                  handleCopy(key, result.formats[key], `Copied ${label}`)
                }
                value={result.formats[key]}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <ToolHelp
        faq={[
          {
            answer:
              'camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE, Title Case, lower case, and UPPER CASE.',
            question: 'What cases are supported?',
          },
          {
            answer:
              'Yes. The word splitter handles camelCase boundaries and acronym runs, so XMLHttpRequest converts to XML Http Request and API_KEY converts to API KEY.',
            question: 'Does it handle camelCase and acronyms?',
          },
        ]}
        howItWorks={{
          description:
            'Paste your text and every case variant updates live. Copy any variant or share a link that restores your input.',
          steps: [
            'Type or paste your text',
            'See all case variants update live',
            'Copy the one you need',
            'Copy a shareable link',
          ],
        }}
      />
    </div>
  );
}
