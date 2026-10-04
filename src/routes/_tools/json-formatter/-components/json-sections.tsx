'use client';

import { FileJson } from 'lucide-react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { LabeledTextarea } from '@/lib/components/labeled-textarea';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';

type JsonAction = 'format' | 'validate' | 'minify';

export function JsonInput({
  onInput,
  value,
}: {
  onInput: (v: string) => void;
  value: string;
}) {
  return (
    <LabeledTextarea
      id="json-input"
      label="JSON Input"
      onChange={(e) => onInput(e.target.value)}
      placeholder="Paste your JSON here..."
      value={value}
    />
  );
}

export function JsonActions({
  computing,
  onCopyLink,
  onRun,
}: {
  computing: boolean;
  onCopyLink: () => void;
  onRun: (a: JsonAction) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button isDisabled={computing} onPress={() => onRun('format')} size="sm">
        <FileJson className="size-4" />
        Format
      </Button>
      <Button
        intent="outline"
        isDisabled={computing}
        onPress={() => onRun('validate')}
        size="sm"
      >
        Validate
      </Button>
      <Button
        intent="outline"
        isDisabled={computing}
        onPress={() => onRun('minify')}
        size="sm"
      >
        Minify
      </Button>
      {computing && (
        <span aria-live="polite" className="text-muted-fg text-xs">
          Processing…
        </span>
      )}
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
    </div>
  );
}

export function JsonOutput({
  activeAction,
  computing,
  copied,
  hasInput,
  onCopy,
  result,
}: {
  activeAction: JsonAction | null;
  computing: boolean;
  copied: boolean;
  hasInput: boolean;
  onCopy: () => void;
  result: {
    error?: string;
    output?: string;
    isValid: boolean;
    timedOut?: boolean;
  } | null;
}) {
  const labels: Record<string, string> = {
    format: 'Formatted',
    minify: 'Minified',
  };
  const label = labels[activeAction ?? ''] ?? 'Validated';
  const showResult = Boolean(
    result && hasInput && !result.timedOut && result.isValid
  );

  return (
    <>
      {hasInput && !result && !computing && (
        <p className="text-muted-fg text-xs">
          Click Format, Validate, or Minify to process your JSON.
        </p>
      )}
      {result && !result.isValid && (
        <ToolError message={result.error} title="Invalid JSON" />
      )}
      {result?.timedOut && (
        <ToolError message={result.error} title="Formatting timed out" />
      )}
      {showResult && result?.output && (
        <ResultPanel
          copied={copied}
          label={label}
          onCopy={onCopy}
          value={result.output}
        />
      )}
    </>
  );
}

export function JsonHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Yes. All processing uses native JSON.parse and JSON.stringify in your browser. No data is ever sent to a server.',
          question: 'Is my data safe?',
        },
        {
          answer:
            'Format adds indentation (2 spaces) to make JSON readable. Validate checks if JSON is valid and normalizes it. Minify removes all unnecessary whitespace to reduce size.',
          question:
            'What is the difference between Format, Validate, and Minify?',
        },
      ]}
      howItWorks={{
        description:
          'Paste your JSON into the input area, then click Format, Validate, or Minify.',
        steps: [
          'Paste JSON into the textarea',
          'Click Format to pretty-print with indentation',
          'Click Validate to check syntax and normalize',
          'Click Minify to compress by removing whitespace',
          'Copy the result with the copy button',
        ],
      }}
    />
  );
}
