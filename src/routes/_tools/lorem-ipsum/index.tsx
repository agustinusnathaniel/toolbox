'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Copy, Link, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Checkbox, CheckboxField } from '@/lib/components/ui/checkbox';
import { Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import { Textarea } from '@/lib/components/ui/textarea';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { generateLoremIpsum } from '@/lib/tools/lorem-ipsum/adapters/lorem-ipsum';
import {
  buildLoremIpsumParams,
  buildLoremIpsumStateFromSearch,
} from '@/lib/tools/lorem-ipsum/adapters/lorem-ipsum-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  format: z.string().optional(),
  paragraphs: z.string().optional(),
  sentences: z.string().optional(),
  startWithLorem: z.string().optional(),
  wordsMax: z.string().optional(),
  wordsMin: z.string().optional(),
});

export const Route = createFileRoute('/_tools/lorem-ipsum/')({
  component: LoremIpsumPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

const HOW_IT_WORKS = {
  description:
    'Generate lorem ipsum placeholder text with configurable size and shareable links.',
  steps: [
    'Adjust paragraphs, sentences per paragraph, and words per sentence',
    'Toggle start with Lorem ipsum and output format (plain or HTML)',
    'Click Generate to regenerate text, then copy or share a link',
  ],
};

const FAQ = [
  {
    answer:
      'Yes. All generation runs in your browser using pure random word logic. No data is ever sent to a server.',
    question: 'Is my data safe?',
  },
  {
    answer:
      'Plain joins paragraphs with blank lines. HTML wraps each paragraph in <p> tags.',
    question: 'What is the difference between Plain and HTML?',
  },
] as const;

const FORMAT_OPTIONS = [
  { id: 'plain', label: 'Plain' },
  { id: 'html', label: 'HTML' },
] as const;

const WORDS_SPLIT_RE = /\s+/;

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: cohesive single-screen island
function LoremIpsumPage() {
  const { trackAction } = useToolTracking(
    'lorem-ipsum',
    'Lorem Ipsum Generator'
  );
  const search = useSearch({ from: '/_tools/lorem-ipsum/' });
  const [state, setState] = useState(() =>
    buildLoremIpsumStateFromSearch(search)
  );
  const [tick, setTick] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();

  // biome-ignore lint/correctness/useExhaustiveDependencies: tick forces regeneration
  const generated = useMemo(
    () =>
      generateLoremIpsum({
        format: state.format,
        paragraphs: state.paragraphs,
        sentencesPerParagraph: state.sentencesPerParagraph,
        startWithLorem: state.startWithLorem,
        wordsPerSentence: { max: state.wordsMax, min: state.wordsMin },
      }),
    [
      state.format,
      state.paragraphs,
      state.sentencesPerParagraph,
      state.startWithLorem,
      state.wordsMin,
      state.wordsMax,
      tick,
    ]
  );

  const handleParagraphsChange = useCallback((value: string) => {
    const n = Number.parseInt(value, 10);
    setState((prev) => ({
      ...prev,
      paragraphs: Number.isNaN(n)
        ? prev.paragraphs
        : Math.min(50, Math.max(1, n)),
    }));
  }, []);

  const handleSentencesChange = useCallback((value: string) => {
    const n = Number.parseInt(value, 10);
    setState((prev) => ({
      ...prev,
      sentencesPerParagraph: Number.isNaN(n)
        ? prev.sentencesPerParagraph
        : Math.min(10, Math.max(1, n)),
    }));
  }, []);

  const handleWordsMinChange = useCallback((value: string) => {
    const n = Number.parseInt(value, 10);
    setState((prev) => ({
      ...prev,
      wordsMin: Number.isNaN(n) ? prev.wordsMin : Math.min(50, Math.max(1, n)),
    }));
  }, []);

  const handleWordsMaxChange = useCallback((value: string) => {
    const n = Number.parseInt(value, 10);
    setState((prev) => ({
      ...prev,
      wordsMax: Number.isNaN(n) ? prev.wordsMax : Math.min(50, Math.max(1, n)),
    }));
  }, []);

  const handleRegenerate = useCallback(() => {
    setTick((t) => t + 1);
    trackAction('generate');
  }, [trackAction]);

  const handleCopy = useCallback(async () => {
    if (await copy(generated, 'output', 'Copied text')) {
      trackAction('copy');
    }
  }, [copy, generated, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildLoremIpsumParams(state),
    trackAction
  );

  const handleClear = useCallback(() => {
    setState(buildLoremIpsumStateFromSearch({}));
    setTick((t) => t + 1);
    trackAction('clear');
  }, [trackAction]);

  const wordCount = useMemo(
    () => generated.split(WORDS_SPLIT_RE).filter(Boolean).length,
    [generated]
  );

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="lorem-paragraphs">Paragraphs (1-50)</Label>
              <Input
                aria-label="Paragraphs"
                id="lorem-paragraphs"
                max={50}
                min={1}
                onChange={(e) => handleParagraphsChange(e.target.value)}
                type="number"
                value={String(state.paragraphs)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="lorem-sentences">
                Sentences per paragraph (1-10)
              </Label>
              <Input
                aria-label="Sentences per paragraph"
                id="lorem-sentences"
                max={10}
                min={1}
                onChange={(e) => handleSentencesChange(e.target.value)}
                type="number"
                value={String(state.sentencesPerParagraph)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="lorem-wordsMin">Words per sentence min</Label>
              <Input
                aria-label="Words min"
                id="lorem-wordsMin"
                max={50}
                min={1}
                onChange={(e) => handleWordsMinChange(e.target.value)}
                type="number"
                value={String(state.wordsMin)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="lorem-wordsMax">Words per sentence max</Label>
              <Input
                aria-label="Words max"
                id="lorem-wordsMax"
                max={50}
                min={1}
                onChange={(e) => handleWordsMaxChange(e.target.value)}
                type="number"
                value={String(state.wordsMax)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <CheckboxField
              isSelected={state.startWithLorem}
              onChange={(v) =>
                setState((prev) => ({ ...prev, startWithLorem: v }))
              }
            >
              <Checkbox>Start with Lorem ipsum</Checkbox>
            </CheckboxField>
            <div className="flex flex-col gap-1">
              <Label htmlFor="lorem-format">Format</Label>
              <Select
                aria-label="Format"
                onSelectionChange={(k) =>
                  setState((prev) => ({
                    ...prev,
                    format: k as 'plain' | 'html',
                  }))
                }
                selectedKey={state.format}
              >
                <SelectTrigger id="lorem-format" />
                <SelectContent items={[...FORMAT_OPTIONS]}>
                  {(option) => (
                    <SelectItem id={option.id}>{option.label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onPress={handleRegenerate} size="sm">
              <RefreshCw className="size-4" />
              Generate
            </Button>
            <Button intent="outline" onPress={handleCopyLink} size="sm">
              <Link className="size-4" />
              Copy link
            </Button>
            <Button intent="outline" onPress={handleClear} size="sm">
              <Trash2 className="size-4" />
              Clear
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Output</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-fg text-xs">{wordCount} words</span>
                <Button
                  aria-label="Copy output"
                  intent="outline"
                  onPress={handleCopy}
                  size="sq-sm"
                >
                  <Copy className="size-4" />
                </Button>
                {copiedKey === 'output' && (
                  <span className="text-success text-xs">Copied</span>
                )}
              </div>
            </div>
            <Textarea
              aria-label="Generated lorem ipsum"
              className="min-h-64 font-mono text-sm"
              readOnly
              value={generated}
            />
          </div>
        </CardContent>
      </Card>
      <ToolHelp faq={[...FAQ]} howItWorks={HOW_IT_WORKS} />
    </div>
  );
}
