'use client';

import { Braces } from 'lucide-react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';

export function JsonToTsInput({
  onInput,
  value,
}: {
  onInput: (v: string) => void;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="json-input">
        JSON Input
      </label>
      <textarea
        className="field-sizing-content min-h-40 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
        id="json-input"
        onChange={(e) => onInput(e.target.value)}
        placeholder="Paste your JSON here..."
        value={value}
      />
    </div>
  );
}

export function JsonToTsActions({
  computing,
  onCopyLink,
  onGenerate,
}: {
  computing: boolean;
  onCopyLink: () => void;
  onGenerate: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onPress={onGenerate} size="sm">
        <Braces className="size-4" />
        Generate
      </Button>
      {computing && (
        <span aria-live="polite" className="text-muted-fg text-xs">
          Generating…
        </span>
      )}
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
    </div>
  );
}

export function JsonToTsOutput({
  copied,
  hasInput,
  onCopy,
  result,
}: {
  copied: boolean;
  hasInput: boolean;
  onCopy: () => void;
  result: {
    error?: string;
    isValid: boolean;
    output?: string;
    timedOut?: boolean;
  } | null;
}) {
  return (
    <>
      {hasInput && !result && (
        <p className="text-muted-fg text-xs">
          Click Generate to turn JSON into TypeScript interfaces.
        </p>
      )}
      {result && !result.isValid && (
        <ToolError message={result.error} title="Invalid JSON or shape" />
      )}
      {result?.timedOut && (
        <ToolError message={result.error} title="Generation timed out" />
      )}
      {result && hasInput && !result.timedOut && result.isValid && (
        <ResultPanel
          copied={copied}
          label="Generated interfaces"
          onCopy={onCopy}
          value={result.output ?? ''}
        />
      )}
    </>
  );
}

export function JsonToTsHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Yes. TypeScript generation uses native JSON.parse in your browser. No data is ever sent to a server.',
          question: 'Is my data safe?',
        },
        {
          answer:
            'Objects are named from their property key in PascalCase (user → User). Arrays of objects use a singularized key (users → User). Collisions get a numeric suffix (User, User2).',
          question: 'How are interface names chosen?',
        },
      ]}
      howItWorks={{
        description:
          'Paste a JSON sample (for example an API response) and click Generate to get TypeScript interfaces you can paste into your project.',
        steps: [
          'Paste JSON into the textarea',
          'Click Generate to build interfaces',
          'Nested objects become their own interfaces',
          'Copy the result with the copy button',
          'Share a link that restores your input',
        ],
      }}
    />
  );
}
