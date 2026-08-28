'use client';

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { ToolHelp } from '@/lib/components/tool-help';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { RegexActions } from './-components/regex-actions';
import {
  RegexFlagsInput,
  RegexPatternInput,
  RegexTestInput,
} from './-components/regex-inputs';
import {
  RegexError,
  RegexHighlights,
  RegexMatchList,
  RegexTimeout,
  RegexTruncated,
} from './-components/regex-results';
import { useRegexPageState } from './-components/use-regex-page';
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
  const s = useRegexPageState();
  const hasError = !!(s.result.error || s.result.timedOut);
  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <RegexPatternInput pattern={s.pattern} setPattern={s.setPattern} />
          <RegexFlagsInput flags={s.flags} setFlags={s.setFlags} />
          <RegexTestInput input={s.input} setInput={s.setInput} />
          <RegexActions
            copiedMatches={s.copiedMatches}
            disabled={s.result.matches.length === 0}
            onCopyLink={s.handleCopyLink}
            onCopyMatches={s.handleCopyMatches}
          />
          <RegexTimeout result={s.result} />
          <RegexTruncated result={s.result} />
          <RegexError result={s.result} />
          {!hasError && (
            <div className="flex flex-col gap-3">
              <span className="text-muted-fg text-sm">{s.matchLabel}</span>
              <RegexHighlights segments={s.segments} />
              <RegexMatchList result={s.result} />
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
