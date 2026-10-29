'use client';

import { FileCode2 } from 'lucide-react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { LabeledTextarea } from '@/lib/components/labeled-textarea';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { FieldLabel } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import type { XmlIndent } from '@/lib/tools/xml-formatter/adapters/xml-formatter';
import type { XmlAction } from '@/lib/tools/xml-formatter/adapters/xml-params';

const INDENT_OPTIONS: ReadonlyArray<{ id: XmlIndent; label: string }> = [
  { id: '2', label: '2 spaces' },
  { id: '4', label: '4 spaces' },
  { id: 'tab', label: 'Tab' },
];

export function XmlInput({
  onInput,
  value,
}: {
  onInput: (v: string) => void;
  value: string;
}) {
  return (
    <LabeledTextarea
      aria-label="XML input"
      id="xml-input"
      label="XML Input"
      onChange={(e) => onInput(e.target.value)}
      placeholder="Paste your XML here... e.g. <root><item>1</item></root>"
      value={value}
    />
  );
}

export function XmlActions({
  computing,
  indent,
  onCopyLink,
  onIndentChange,
  onRun,
}: {
  computing: boolean;
  indent: XmlIndent;
  onCopyLink: () => void;
  onIndentChange: (indent: XmlIndent) => void;
  onRun: (a: XmlAction) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="xml-indent">Indent</FieldLabel>
        <Select
          onValueChange={(key) => onIndentChange(key as XmlIndent)}
          value={indent}
        >
          <SelectTrigger aria-label="Select option">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INDENT_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => onRun('format')} size="sm" variant="default">
          <FileCode2 className="size-4" />
          Format
        </Button>
        <Button onClick={() => onRun('validate')} size="sm" variant="outline">
          Validate
        </Button>
        <Button onClick={() => onRun('minify')} size="sm" variant="outline">
          Minify
        </Button>
        <CopyLinkButton label="Copy shareable link" onClick={onCopyLink} />
        {computing && (
          <span aria-live="polite" className="text-muted-foreground text-xs">
            Processing…
          </span>
        )}
      </div>
    </div>
  );
}

export function XmlOutput({
  activeAction,
  computing,
  copied,
  hasInput,
  onCopy,
  result,
}: {
  activeAction: XmlAction | null;
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
  const showResult = Boolean(result && hasInput && result.isValid);

  return (
    <>
      {hasInput && !result && !computing && (
        <p className="text-muted-foreground text-xs">
          Click Format, Validate, or Minify to process your XML.
        </p>
      )}
      {result && !result.isValid && !result.timedOut && (
        <ToolError message={result.error} title="Invalid XML" />
      )}
      {result?.timedOut && (
        <ToolError message={result.error} title="Processing timed out" />
      )}
      {activeAction === 'validate' && showResult && (
        <p
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm"
          role="status"
        >
          Valid XML. The input is well-formed.
        </p>
      )}
      {showResult && activeAction !== 'validate' && result?.output && (
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

export function XmlHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Yes. All processing uses the built-in DOMParser in your browser. No data is ever sent to a server.',
          question: 'Is my data safe?',
        },
        {
          answer:
            'Format adds indentation to make XML readable. Validate checks that XML is well-formed and reports the line number of the first error. Minify removes all unnecessary whitespace to reduce size.',
          question:
            'What is the difference between Format, Validate, and Minify?',
        },
        {
          answer:
            'Use Copy link to get a shareable URL that restores your input and indent style for anyone who opens it.',
          question: 'How do shareable links work?',
        },
      ]}
      howItWorks={{
        description:
          'Paste your XML into the input area, pick an indent style, then click Format, Validate, or Minify.',
        steps: [
          'Paste XML into the textarea',
          'Choose an indent style (2 spaces, 4 spaces, or tab)',
          'Click Format to pretty-print with indentation',
          'Click Validate to check well-formedness',
          'Click Minify to compress by removing whitespace',
          'Copy the result or copy a shareable link',
        ],
      }}
    />
  );
}
