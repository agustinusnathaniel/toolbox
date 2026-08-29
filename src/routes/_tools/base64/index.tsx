'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Binary, Check, Copy, Link } from 'lucide-react';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { Base64Result } from '@/lib/tools/base64/adapters/base64';
import { decodeBase64, encodeBase64 } from '@/lib/tools/base64/adapters/base64';
import { buildBase64Params } from '@/lib/tools/base64/adapters/base64-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/base64/')({
  component: Base64Page,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function useBase64State() {
  const search = useSearch({ from: '/_tools/base64/' });
  const [input, setInput] = useState(search.input ?? '');
  const [result, setResult] = useState<Base64Result | null>(null);
  const [activeAction, setActiveAction] = useState<'encode' | 'decode' | null>(
    null
  );
  return { activeAction, input, result, setActiveAction, setInput, setResult };
}

function useBase64Actions(
  input: string,
  result: Base64Result | null,
  setResult: (v: Base64Result | null) => void,
  setActiveAction: (v: 'encode' | 'decode' | null) => void,
  trackAction: (a: string) => void,
  copy: (text: string, key: string, toast: string) => Promise<boolean>
) {
  const handleEncode = useCallback(() => {
    const res = encodeBase64(input);
    setResult(res);
    setActiveAction('encode');
    trackAction('encode');
  }, [input, trackAction, setActiveAction, setResult]);
  const handleDecode = useCallback(() => {
    const res = decodeBase64(input);
    setResult(res);
    setActiveAction('decode');
    trackAction('decode');
  }, [input, trackAction, setResult, setActiveAction]);
  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copy(result.output, 'copy', 'Copied Base64 result')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);
  return { handleCopy, handleDecode, handleEncode };
}

function Base64Input({
  input,
  setInput,
  setResult,
}: {
  input: string;
  setInput: (v: string) => void;
  setResult: (v: Base64Result | null) => void;
}) {
  return (
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
  );
}

function Base64Actions({
  onEncode,
  onDecode,
  onCopyLink,
}: {
  onEncode: () => void;
  onDecode: () => void;
  onCopyLink: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onPress={onEncode} size="sm">
        <Binary className="size-4" />
        Encode
      </Button>
      <Button intent="outline" onPress={onDecode} size="sm">
        Decode
      </Button>
      <Button
        aria-label="Copy shareable link"
        intent="outline"
        onPress={onCopyLink}
        size="sm"
      >
        <Link className="size-4" />
        Copy link
      </Button>
    </div>
  );
}

function Base64ResultPanel({
  result,
  label,
  copiedKey,
  onCopy,
}: {
  result: Base64Result | null;
  label: string;
  copiedKey: string | null;
  onCopy: () => void;
}) {
  if (!(result?.isValid && result.output)) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-fg text-sm">{label}</span>
        <Button
          aria-label="Copy result"
          intent="outline"
          onPress={onCopy}
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
        {result.output}
      </pre>
    </div>
  );
}

function Base64CardBody({
  input,
  setInput,
  setResult,
  onEncode,
  onDecode,
  onCopyLink,
  hintVisible,
  errorVisible,
  result,
  label,
  copiedKey,
  onCopy,
}: {
  input: string;
  setInput: (v: string) => void;
  setResult: (v: Base64Result | null) => void;
  onEncode: () => void;
  onDecode: () => void;
  onCopyLink: () => void;
  hintVisible: boolean;
  errorVisible: boolean;
  result: Base64Result | null;
  label: string;
  copiedKey: string | null;
  onCopy: () => void;
}) {
  return (
    <CardContent className="flex flex-col gap-4">
      <Base64Input input={input} setInput={setInput} setResult={setResult} />
      <Base64Actions
        onCopyLink={onCopyLink}
        onDecode={onDecode}
        onEncode={onEncode}
      />
      {hintVisible && (
        <p className="text-muted-fg text-xs">
          Click Encode or Decode to process your text.
        </p>
      )}
      {errorVisible && (
        <div
          className="rounded-lg border border-danger/30 bg-danger/5 p-3"
          role="alert"
        >
          <p className="font-medium text-danger text-sm">Invalid base64</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
            {result?.error}
          </pre>
        </div>
      )}
      <Base64ResultPanel
        copiedKey={copiedKey}
        label={label}
        onCopy={onCopy}
        result={result}
      />
    </CardContent>
  );
}

function Base64Page() {
  const { trackAction } = useToolTracking('base64', 'Base64 Encoder/Decoder');
  const { input, setInput, result, setResult, activeAction, setActiveAction } =
    useBase64State();
  const { copiedKey, copy } = useCopyFeedback();
  const { handleEncode, handleDecode, handleCopy } = useBase64Actions(
    input,
    result,
    setResult,
    setActiveAction,
    trackAction,
    copy
  );
  const handleCopyLink = useCopyShareableLink(
    () => buildBase64Params(input),
    trackAction
  );
  const label = activeAction === 'encode' ? 'Encoded' : 'Decoded';
  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <Base64CardBody
          copiedKey={copiedKey}
          errorVisible={!!(result && !result.isValid)}
          hintVisible={!!(input.trim() && !result)}
          input={input}
          label={label}
          onCopy={handleCopy}
          onCopyLink={handleCopyLink}
          onDecode={handleDecode}
          onEncode={handleEncode}
          result={result && input.trim() ? result : null}
          setInput={setInput}
          setResult={setResult}
        />
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
