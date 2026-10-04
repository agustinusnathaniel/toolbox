'use client';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { LabeledTextarea } from '@/lib/components/labeled-textarea';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToggleBar } from '@/lib/components/toggle-bar';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';

const EXAMPLES = [
  '<div>Hello & "world"</div>',
  'Tom & Jerry',
  '&lt;p&gt;Hello &amp; welcome&lt;/p&gt;',
  '&#60;script&#62;alert(&#34;hi&#34;)&#60;/script&#62;',
];

const MODE_OPTIONS = [
  { action: 'encode', id: 'encode', label: 'Encode' },
  { action: 'decode', id: 'decode', label: 'Decode' },
] as const;

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
    <LabeledTextarea
      aria-label="HTML input"
      id="html-entities-input"
      label="Input"
      onChange={(e) => onInput(e.target.value)}
      placeholder={
        mode === 'encode'
          ? 'Paste HTML or text to encode (e.g. <div> & "hello")...'
          : 'Paste encoded HTML to decode (e.g. &lt;div&gt; &amp; &quot;hello&quot;)...'
      }
      value={input}
    />
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
      <ToggleBar
        onSelectionChange={onMode}
        options={MODE_OPTIONS}
        track={track}
        value={mode}
      />
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
        <ResultPanel
          copied={copied}
          label={label}
          onCopy={onCopy}
          value={result}
        />
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
