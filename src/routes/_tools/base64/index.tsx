'use client';

import { createFileRoute } from '@tanstack/react-router';
import { Binary, Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import type { Base64Result } from '@/lib/tools/base64/adapters/base64';
import { decodeBase64, encodeBase64 } from '@/lib/tools/base64/adapters/base64';
import { copyToClipboard } from '@/lib/utils/clipboard';

const meta = {
  description: 'Encode and decode text between UTF-8 and Base64.',
  pageTitle: 'Base64 Encoder/Decoder',
  slug: 'base64',
} as const;

export const Route = createFileRoute('/_tools/base64/')({
  component: Base64Page,
  head: () => ({
    meta: [
      { title: meta.pageTitle },
      { content: meta.description, name: 'description' },
      { content: meta.pageTitle, property: 'og:title' },
      { content: meta.description, property: 'og:description' },
      { content: 'website', property: 'og:type' },
    ],
  }),
  staticData: {
    meta,
  },
});

function Base64Page() {
  const { trackAction } = useToolTracking('base64', 'Base64 Encoder/Decoder');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Base64Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState<'encode' | 'decode' | null>(
    null
  );

  const handleEncode = useCallback(() => {
    const res = encodeBase64(input);
    setResult(res);
    setActiveAction('encode');
    setCopied(false);
    trackAction('encode');
  }, [input, trackAction]);

  const handleDecode = useCallback(() => {
    const res = decodeBase64(input);
    setResult(res);
    setActiveAction('decode');
    setCopied(false);
    trackAction('decode');
  }, [input, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    await copyToClipboard(result.output, 'Copied Base64 result');
    setCopied(true);
    trackAction('copy');
    setTimeout(() => setCopied(false), 1500);
  }, [result, trackAction]);

  const label = activeAction === 'encode' ? 'Encoded' : 'Decoded';
  const showResult = result && input.trim();
  const showError = result && !result.isValid;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="base64-input">
              Input
            </label>
            <textarea
              className="field-sizing-content min-h-40 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
              id="base64-input"
              onChange={(e) => {
                setInput(e.target.value);
                setResult(null);
              }}
              placeholder="Type or paste text to encode or decode..."
              value={input}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onPress={handleEncode} size="sm">
              <Binary className="size-4" />
              Encode
            </Button>
            <Button intent="outline" onPress={handleDecode} size="sm">
              Decode
            </Button>
          </div>

          {input.trim() && !result && (
            <p className="text-muted-fg text-xs">
              Click Encode or Decode to process your text.
            </p>
          )}

          {showError && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">Invalid base64</p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {showResult && result.isValid && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-fg text-sm">{label}</span>
                <Button
                  aria-label="Copy result"
                  intent="outline"
                  onPress={handleCopy}
                  size="sq-sm"
                >
                  {copied ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
                {result.output}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All processing uses the native TextEncoder and TextDecoder APIs in your browser. No data is ever sent to a server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'Encode converts UTF-8 text into a Base64 string. Decode converts Base64 back into readable text. Base64 represents binary data using only ASCII characters.',
            question: 'What is the difference between Encode and Decode?',
          },
        ]}
        howItWorks={{
          description:
            'Type or paste text into the input area, then click Encode or Decode.',
          steps: [
            'Type or paste text into the textarea',
            'Click Encode to convert text to Base64',
            'Click Decode to convert Base64 back to text',
            'Copy the result with the copy button',
          ],
        }}
      />
    </div>
  );
}
