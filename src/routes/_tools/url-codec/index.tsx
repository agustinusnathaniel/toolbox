'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type {
  UrlCodecDecodeResult,
  UrlCodecDirection,
} from '@/lib/tools/url-codec/adapters/url-codec';
import { decodeUrl, encodeUrl } from '@/lib/tools/url-codec/adapters/url-codec';
import {
  buildUrlCodecParams,
  buildUrlCodecStateFromSearch,
} from '@/lib/tools/url-codec/adapters/url-codec-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  direction: z.enum(['decode', 'encode']).optional(),
  input: z.string().optional(),
  mode: z.enum(['component', 'full']).optional(),
});

const MODE_HINT =
  'Component mode encodes every reserved character (/ ? &), so a value can be embedded in a query parameter. Full URL mode keeps the URL structure readable.';

function getResultLabel(
  direction: UrlCodecDirection,
  isValid: boolean
): string {
  if (!isValid) {
    return 'Invalid encoding';
  }
  return direction === 'encode' ? 'Encoded' : 'Decoded';
}

export const Route = createFileRoute('/_tools/url-codec/')({
  component: UrlCodecPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function UrlCodecPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'url-codec',
    'URL Encoder & Decoder'
  );
  const search = useSearch({ from: '/_tools/url-codec/' });
  const [state, setState] = useState(() =>
    buildUrlCodecStateFromSearch(search)
  );
  const { copiedKey, copy } = useCopyFeedback();

  const result = useMemo<UrlCodecDecodeResult | null>(() => {
    if (!state.input.trim()) {
      return null;
    }
    if (state.direction === 'encode') {
      return { isValid: true, output: encodeUrl(state.input, state.mode) };
    }
    return decodeUrl(state.input, state.mode);
  }, [state.direction, state.input, state.mode]);

  useEffect(() => {
    if (result?.isValid && result.output.length > 0) {
      trackComplete(true);
    }
  }, [result, trackComplete]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    const label =
      state.direction === 'encode'
        ? 'Copied encoded URL'
        : 'Copied decoded URL';
    if (await copy(result.output, 'copy', label)) {
      trackAction('copy');
    }
  }, [copy, result, state.direction, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildUrlCodecParams(state),
    trackAction
  );

  const resultLabel = getResultLabel(state.direction, result?.isValid ?? false);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="url-codec-input">
              URL or text
            </label>
            <Textarea
              aria-label="URL or text"
              className="min-h-40 font-mono"
              id="url-codec-input"
              onChange={(e) =>
                setState((prev) => ({ ...prev, input: e.target.value }))
              }
              placeholder="Paste a URL or text to encode or decode..."
              value={state.input}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              intent={state.direction === 'encode' ? 'primary' : 'outline'}
              onPress={() => {
                setState((prev) => ({ ...prev, direction: 'encode' }));
                trackAction('encode');
              }}
            >
              Encode
            </Button>
            <Button
              intent={state.direction === 'decode' ? 'primary' : 'outline'}
              onPress={() => {
                setState((prev) => ({ ...prev, direction: 'decode' }));
                trackAction('decode');
              }}
            >
              Decode
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-2">
              <Button
                intent={state.mode === 'component' ? 'primary' : 'outline'}
                onPress={() => {
                  setState((prev) => ({ ...prev, mode: 'component' }));
                  trackAction('mode_component');
                }}
                size="sm"
              >
                Component
              </Button>
              <Button
                intent={state.mode === 'full' ? 'primary' : 'outline'}
                onPress={() => {
                  setState((prev) => ({ ...prev, mode: 'full' }));
                  trackAction('mode_full');
                }}
                size="sm"
              >
                Full URL
              </Button>
            </div>
            <p className="text-muted-fg text-xs">{MODE_HINT}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyLinkButton
              label="Copy shareable link"
              onPress={handleCopyLink}
            />
          </div>

          {result && (
            <div className="flex flex-col gap-2">
              {result.isValid ? (
                <ResultPanel
                  copied={copiedKey === 'copy'}
                  label={resultLabel}
                  onCopy={handleCopy}
                  value={result.output}
                />
              ) : (
                <>
                  <span className="font-medium text-danger text-sm">
                    {resultLabel}
                  </span>
                  <ToolError message={result.error} />
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Component mode encodes every reserved character, so https://example.com/a b becomes https%3A%2F%2Fexample.com%2Fa%20b. That is what you want when embedding a value in a query parameter. Full URL mode keeps separators like /, ?, and & readable so a whole address stays recognizable.',
            question:
              'What is the difference between Component and Full URL modes?',
          },
          {
            answer:
              'Yes. Encoding and decoding use the browser-native encodeURIComponent and decodeURIComponent. Everything runs locally and no data ever leaves your device.',
            question: 'Is my data safe?',
          },
        ]}
        howItWorks={{
          description:
            'Paste your text, pick Encode or Decode, choose a mode, and copy the live result.',
          steps: [
            'Paste a URL or text into the input',
            'Choose Encode or Decode',
            'Pick Component mode for values or Full URL mode for whole addresses',
            'Copy the result or copy a shareable link',
          ],
        }}
      />
    </div>
  );
}
