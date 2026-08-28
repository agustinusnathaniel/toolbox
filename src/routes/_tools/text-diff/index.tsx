'use client';

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { ToolHelp } from '@/lib/components/tool-help';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { DiffActions } from './-components/diff-actions';
import { DiffInputs } from './-components/diff-inputs';
import {
  DiffError,
  DiffHint,
  DiffResults,
  DiffTimeout,
  NoDifferences,
} from './-components/diff-results';
import { useTextDiffPageState } from './-components/use-text-diff-page';
import { meta } from './-meta';

const searchSchema = z.object({
  modified: z.string().optional(),
  original: z.string().optional(),
});

export const Route = createFileRoute('/_tools/text-diff/')({
  component: TextDiffPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function TextDiffPage() {
  const s = useTextDiffPageState();
  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <DiffInputs
            modified={s.modified}
            original={s.original}
            setActiveAction={s.setActiveAction as never}
            setModified={s.setModified}
            setOriginal={s.setOriginal}
            setResult={s.setResult as never}
          />
          <DiffActions
            computing={s.computing}
            onCompare={s.handleCompare}
            onCopyLink={s.handleCopyLink}
            onSwap={s.handleSwap}
          />
          <DiffHint show={!!s.showHint} />
          <DiffError result={s.result} />
          <DiffTimeout result={s.result} />
          <DiffResults
            computing={s.computing}
            copiedKey={s.copiedKey}
            fileDiff={s.fileDiff}
            fileDiffOptions={s.fileDiffOptions as never}
            onCopyDiff={s.handleCopyDiff}
            result={s.result}
            showError={!!s.showError}
            showHint={!!s.showHint}
            showNoDifferences={!!s.showNoDifferences}
            view={s.view as never}
          />
          <NoDifferences show={!!s.showNoDifferences} />
        </CardContent>
      </Card>
      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All comparison happens in your browser. Nothing is sent to a server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'Green lines were added, red lines were removed, and highlighted words show the exact text that changed within a line. Switch between Unified and Split views to see the diff side by side.',
            question: 'What do the colors mean?',
          },
          {
            answer:
              'Each side can be up to 500,000 characters. Large or heavily-changed inputs are computed in the background so the page stays responsive; comparisons that take too long show a timeout message.',
            question: 'What is the largest input supported?',
          },
        ]}
        howItWorks={{
          description:
            'Paste two versions of a text, then compare them to see what changed.',
          steps: [
            'Paste the original text into the first box',
            'Paste the modified text into the second box',
            'Click Compare to see the line-by-line differences',
            'Copy the diff or a shareable link with the buttons',
          ],
        }}
      />
    </div>
  );
}
