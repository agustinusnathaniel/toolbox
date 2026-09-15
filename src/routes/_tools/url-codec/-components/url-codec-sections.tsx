'use client';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Textarea } from '@/lib/components/ui/textarea';
import type { UrlCodecDecodeResult } from '@/lib/tools/url-codec/adapters/url-codec';

const MODE_HINT =
  'Component mode encodes every reserved character (/ ? &), so a value can be embedded in a query parameter. Full URL mode keeps the URL structure readable.';

export function UrlCodecInputs({
  input,
  onInput,
}: {
  input: string;
  onInput: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="url-codec-input">
        URL or text
      </label>
      <Textarea
        aria-label="URL or text"
        className="min-h-40 font-mono"
        id="url-codec-input"
        onChange={(e) => onInput(e.target.value)}
        placeholder="Paste a URL or text to encode or decode..."
        value={input}
      />
    </div>
  );
}

export function UrlCodecDirectionBar({
  direction,
  onChange,
  track,
}: {
  direction: 'encode' | 'decode';
  onChange: (d: 'encode' | 'decode') => void;
  track: (a: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        intent={direction === 'encode' ? 'primary' : 'outline'}
        onPress={() => {
          onChange('encode');
          track('encode');
        }}
      >
        Encode
      </Button>
      <Button
        intent={direction === 'decode' ? 'primary' : 'outline'}
        onPress={() => {
          onChange('decode');
          track('decode');
        }}
      >
        Decode
      </Button>
    </div>
  );
}

export function UrlCodecModeBar({
  mode,
  onChange,
  track,
}: {
  mode: 'component' | 'full';
  onChange: (m: 'component' | 'full') => void;
  track: (a: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <Button
          intent={mode === 'component' ? 'primary' : 'outline'}
          onPress={() => {
            onChange('component');
            track('mode_component');
          }}
          size="sm"
        >
          Component
        </Button>
        <Button
          intent={mode === 'full' ? 'primary' : 'outline'}
          onPress={() => {
            onChange('full');
            track('mode_full');
          }}
          size="sm"
        >
          Full URL
        </Button>
      </div>
      <p className="text-muted-fg text-xs">{MODE_HINT}</p>
    </div>
  );
}

export function UrlCodecResult({
  copied,
  label,
  onCopy,
  result,
}: {
  copied: boolean;
  label: string;
  onCopy: () => void;
  result: UrlCodecDecodeResult | null;
}) {
  if (!result) {
    return null;
  }
  if (!result.isValid) {
    return (
      <div className="flex flex-col gap-2">
        <span className="font-medium text-danger text-sm">{label}</span>
        <ToolError message={result.error} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <ResultPanel
        copied={copied}
        label={label}
        onCopy={onCopy}
        value={result.output}
      />
    </div>
  );
}

export function UrlCodecActions({ onCopyLink }: { onCopyLink: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
    </div>
  );
}

export function UrlCodecHelp() {
  return (
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
  );
}
