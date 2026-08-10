'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Copy, Link } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Input } from '@/lib/components/ui/input';
import { Textarea } from '@/lib/components/ui/textarea';
import { testRegex } from '@/lib/tools/regex-tester/adapters/regex';
import { buildRegexParams } from '@/lib/tools/regex-tester/adapters/regex-params';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  flags: z.string().optional(),
  input: z.string().optional(),
  pattern: z.string().optional(),
});

export const Route = createFileRoute('/_tools/regex-tester/')({
  component: RegexTesterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function RegexTesterPage() {
  const { trackAction } = useToolTracking('regex-tester', 'Regex Tester');
  const search = useSearch({ from: '/_tools/regex-tester/' });
  const [pattern, setPattern] = useState(search.pattern ?? '');
  const [flags, setFlags] = useState(search.flags ?? '');
  const [input, setInput] = useState(search.input ?? '');
  const [copiedMatches, setCopiedMatches] = useState(false);

  const result = useMemo(
    () => testRegex(pattern, flags, input),
    [pattern, flags, input]
  );

  const previousInput = useRef<{
    flags: string;
    input: string;
    pattern: string;
  } | null>(null);

  useEffect(() => {
    const prev = previousInput.current;
    if (
      prev !== null &&
      (prev.pattern !== pattern || prev.flags !== flags || prev.input !== input)
    ) {
      trackAction('test');
    }
    previousInput.current = { flags, input, pattern };
  }, [flags, input, pattern, trackAction]);

  const segments = useMemo(() => {
    const segs: Array<{ matched: boolean; start: number; text: string }> = [];
    let cursor = 0;
    for (const match of result.matches) {
      if (match.full.length === 0) {
        continue;
      }
      if (match.index > cursor) {
        segs.push({
          matched: false,
          start: cursor,
          text: input.slice(cursor, match.index),
        });
      }
      segs.push({ matched: true, start: match.index, text: match.full });
      cursor = match.index + match.full.length;
    }
    if (cursor < input.length) {
      segs.push({ matched: false, start: cursor, text: input.slice(cursor) });
    }
    return segs;
  }, [input, result.matches]);

  const handleCopyLink = useCallback(async () => {
    const params = buildRegexParams(pattern, flags, input);
    const url = `${window.location.origin}${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    if (await copyToClipboard(url, 'Copied Shareable Link')) {
      trackAction('share');
    }
  }, [input, pattern, flags, trackAction]);

  const handleCopyMatches = useCallback(async () => {
    if (result.matches.length === 0) {
      return;
    }
    const text = result.matches.map((match) => match.full).join('\n');
    if (await copyToClipboard(text, 'Copied Matches')) {
      setCopiedMatches(true);
      trackAction('copy');
      setTimeout(() => setCopiedMatches(false), 1500);
    }
  }, [result.matches, trackAction]);

  const matchLabel =
    result.matchCount === 1 ? '1 match' : `${result.matchCount} matches`;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="regex-pattern">
              Pattern
            </label>
            <Input
              aria-label="Regular expression pattern"
              className="font-mono"
              id="regex-pattern"
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. (\w+)@(\w+)"
              value={pattern}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="regex-flags">
              Flags
            </label>
            <Input
              aria-label="Regular expression flags"
              className="font-mono"
              id="regex-flags"
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gimsuy"
              value={flags}
            />
            <p className="text-muted-fg text-xs">Valid flags: g i m s u y</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="regex-input">
              Test text
            </label>
            <Textarea
              aria-label="Test text"
              className="min-h-40 font-mono"
              id="regex-input"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste or type the text to test against..."
              value={input}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              aria-label="Copy shareable link"
              intent="outline"
              onPress={handleCopyLink}
              size="sm"
            >
              <Link className="size-4" />
              Copy link
            </Button>
            <Button
              aria-label="Copy matches"
              intent="outline"
              isDisabled={result.matches.length === 0}
              onPress={handleCopyMatches}
              size="sm"
            >
              {copiedMatches ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
              Copy matches
            </Button>
          </div>

          {result.error && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">
                Invalid regular expression
              </p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {!result.error && (
            <div className="flex flex-col gap-3">
              <span className="text-muted-fg text-sm">{matchLabel}</span>

              {segments.length > 0 && (
                <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
                  {segments.map((segment) =>
                    segment.matched ? (
                      <mark
                        className="rounded bg-primary/20 text-fg"
                        key={segment.start}
                      >
                        {segment.text}
                      </mark>
                    ) : (
                      <span key={segment.start}>{segment.text}</span>
                    )
                  )}
                </pre>
              )}

              {result.matches.length > 0 && (
                <ol className="flex max-h-80 flex-col gap-2 overflow-auto">
                  {result.matches.map((match) => (
                    <li
                      className="rounded-lg border bg-(--card-bg)/50 p-3"
                      key={match.index}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <code className="min-w-0 truncate font-mono text-sm">
                          {match.full}
                        </code>
                        <span className="shrink-0 text-muted-fg text-xs">
                          index {match.index}
                        </span>
                      </div>
                      {match.groups.some((group) => group !== undefined) && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {match.groups
                            .map((group, groupIndex) => ({ group, groupIndex }))
                            .filter((entry) => entry.group !== undefined)
                            .map((entry) => (
                              <code
                                className="font-mono text-xs"
                                key={entry.groupIndex}
                              >
                                group {entry.groupIndex + 1}: {entry.group}
                              </code>
                            ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All matching uses the native JavaScript RegExp engine in your browser. No data is ever sent to a server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'Matches update live as you type. Use the flags field to enable global (g), case-insensitive (i), multiline (m), dotall (s), unicode (u), or sticky (y) matching.',
            question: 'How do flags work?',
          },
        ]}
        howItWorks={{
          description:
            'Type a regular expression pattern, choose flags, and add test text to see live matches.',
          steps: [
            'Enter a pattern in the Pattern field',
            'Add flags such as g, i, m, s, u, or y',
            'Paste or type test text',
            'Review the highlighted matches and capture groups',
          ],
        }}
      />
    </div>
  );
}
