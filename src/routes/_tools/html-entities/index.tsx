'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Copy, Link } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  decodeHtmlEntities,
  encodeHtmlEntities,
} from '@/lib/tools/html-entities/adapters/html-entities';
import {
  buildHtmlEntitiesParams,
  buildHtmlEntitiesStateFromSearch,
} from '@/lib/tools/html-entities/adapters/html-entities-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
  mode: z.enum(['encode', 'decode']).optional(),
});

export const Route = createFileRoute('/_tools/html-entities/')({
  component: HtmlEntitiesPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

const EXAMPLES = [
  '<div>Hello & "world"</div>',
  'Tom & Jerry',
  '&lt;p&gt;Hello &amp; welcome&lt;/p&gt;',
  '&#60;script&#62;alert(&#34;hi&#34;)&#60;/script&#62;',
];

function HtmlEntitiesPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'html-entities',
    'HTML Entity Codec'
  );
  const search = useSearch({ from: '/_tools/html-entities/' });
  const [state, setState] = useState(() =>
    buildHtmlEntitiesStateFromSearch(search)
  );
  const { copiedKey, copy } = useCopyFeedback();

  const result = useMemo(() => {
    if (!state.input) {
      return '';
    }
    return state.mode === 'encode'
      ? encodeHtmlEntities(state.input)
      : decodeHtmlEntities(state.input);
  }, [state.input, state.mode]);

  useEffect(() => {
    if (result.length > 0 && state.input.trim().length > 0) {
      trackComplete(true);
    }
  }, [result, state.input, trackComplete]);

  const handleCopy = useCallback(async () => {
    if (!result) {
      return;
    }
    if (await copy(result, 'copy', 'Copied result')) {
      trackAction('copy');
    }
  }, [copy, result, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildHtmlEntitiesParams(state.input, state.mode),
    trackAction
  );

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, input: '' }));
    trackAction('clear');
  }, [trackAction]);

  const resultLabel = state.mode === 'encode' ? 'Encoded' : 'Decoded';
  const hasInput = state.input.trim().length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              className="text-muted-fg text-sm"
              htmlFor="html-entities-input"
            >
              Input
            </label>
            <Textarea
              aria-label="HTML input"
              className="min-h-40 font-mono"
              id="html-entities-input"
              onChange={(e) =>
                setState((prev) => ({ ...prev, input: e.target.value }))
              }
              placeholder={
                state.mode === 'encode'
                  ? 'Paste HTML or text to encode (e.g. <div> & "hello")...'
                  : 'Paste encoded HTML to decode (e.g. &lt;div&gt; &amp; &quot;hello&quot;)...'
              }
              value={state.input}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              intent={state.mode === 'encode' ? 'primary' : 'outline'}
              onPress={() => {
                setState((prev) => ({ ...prev, mode: 'encode' }));
                trackAction('encode');
              }}
            >
              Encode
            </Button>
            <Button
              intent={state.mode === 'decode' ? 'primary' : 'outline'}
              onPress={() => {
                setState((prev) => ({ ...prev, mode: 'decode' }));
                trackAction('decode');
              }}
            >
              Decode
            </Button>
            <Button intent="outline" onPress={handleClear} size="sm">
              Clear
            </Button>
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
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-muted-fg text-xs">Try:</span>
            {EXAMPLES.map((ex) => (
              <Button
                intent="outline"
                key={ex}
                onPress={() => {
                  setState((prev) => ({ ...prev, input: ex }));
                  trackAction('example');
                }}
                size="sm"
              >
                <span className="max-w-[20ch] truncate font-mono text-xs">
                  {ex.slice(0, 24)}
                </span>
              </Button>
            ))}
          </div>

          {result && hasInput && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-fg text-sm">{resultLabel}</span>
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
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
                {result}
              </pre>
            </div>
          )}

          {!hasInput && (
            <p className="text-muted-fg text-xs">
              Type or paste text to see the {resultLabel.toLowerCase()} result
              live.
            </p>
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. Encoding and decoding use pure string replacement in your browser. No data is ever sent to a server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'Encode converts &, <, >, ", and \' into named entities (&amp; &lt; &gt; &quot; &#39;). Decode reverses named entities plus numeric decimal (&#60;) and hex (&#x3C;) forms, leaving unknown entities untouched.',
            question: 'What characters are encoded and decoded?',
          },
        ]}
        howItWorks={{
          description:
            'Paste your text, pick Encode or Decode, and copy the live result.',
          steps: [
            'Paste text or HTML into the input',
            'Choose Encode to escape or Decode to unescape',
            'Copy the result or copy a shareable link',
            'Use Clear or try an example chip to reset',
          ],
        }}
      />
    </div>
  );
}
