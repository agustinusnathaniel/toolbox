'use client';

import { CopyButton } from '@/lib/components/copy-button';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Textarea } from '@/lib/components/ui/textarea';

const EXAMPLES = [
  '<div>Hello & "world"</div>',
  'Tom & Jerry',
  '&lt;p&gt;Hello &amp; welcome&lt;/p&gt;',
  '&#60;script&#62;alert(&#34;hi&#34;)&#60;/script&#62;',
];

export function HtmlEntitiesInput({
  input,
  mode,
  onInput,
}: {
  input: string;
  mode: 'encode' | 'decode';
  onInput: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="html-entities-input">
        Input
      </label>
      <Textarea
        aria-label="HTML input"
        className="min-h-40 font-mono"
        id="html-entities-input"
        onChange={(e) => onInput(e.target.value)}
        placeholder={
          mode === 'encode'
            ? 'Paste HTML or text to encode (e.g. <div> & "hello")...'
            : 'Paste encoded HTML to decode (e.g. &lt;div&gt; &amp; &quot;hello&quot;)...'
        }
        value={input}
      />
    </div>
  );
}

export function HtmlEntitiesModes({
  mode,
  onClear,
  onMode,
  track,
}: {
  mode: 'encode' | 'decode';
  onClear: () => void;
  onMode: (m: 'encode' | 'decode') => void;
  track: (a: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        intent={mode === 'encode' ? 'primary' : 'outline'}
        onPress={() => {
          onMode('encode');
          track('encode');
        }}
      >
        Encode
      </Button>
      <Button
        intent={mode === 'decode' ? 'primary' : 'outline'}
        onPress={() => {
          onMode('decode');
          track('decode');
        }}
      >
        Decode
      </Button>
      <Button intent="outline" onPress={onClear} size="sm">
        Clear
      </Button>
    </div>
  );
}

export function HtmlEntitiesExamples({
  onExample,
}: {
  onExample: (ex: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-muted-fg text-xs">Try:</span>
      {EXAMPLES.map((ex) => (
        <Button
          intent="outline"
          key={ex}
          onPress={() => onExample(ex)}
          size="sm"
        >
          <span className="max-w-[20ch] truncate font-mono text-xs">
            {ex.slice(0, 24)}
          </span>
        </Button>
      ))}
    </div>
  );
}

export function HtmlEntitiesOutput({
  copied,
  hasInput,
  label,
  onCopy,
  result,
}: {
  copied: boolean;
  hasInput: boolean;
  label: string;
  onCopy: () => void;
  result: string;
}) {
  return (
    <>
      {result && hasInput && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-fg text-sm">{label}</span>
            <CopyButton copied={copied} label="Copy result" onPress={onCopy} />
          </div>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
            {result}
          </pre>
        </div>
      )}
      {!hasInput && (
        <p className="text-muted-fg text-xs">
          Type or paste text to see the {label.toLowerCase()} result live.
        </p>
      )}
    </>
  );
}

export function HtmlEntitiesHelp() {
  return (
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
  );
}

export function HtmlEntitiesShare({ onCopyLink }: { onCopyLink: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
    </div>
  );
}
