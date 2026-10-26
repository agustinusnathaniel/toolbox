'use client';

import { Check, FileCheck2, X } from 'lucide-react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { LabeledTextarea } from '@/lib/components/labeled-textarea';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Badge } from '@/lib/components/ui/badge';
import { Button } from '@/lib/components/ui/button';
import type { SchemaValidationResult } from '@/lib/tools/json-schema-validator/adapters/json-schema-validator';

type ValidationState = SchemaValidationResult & { timedOut?: boolean };

export function JsonSchemaInputs({
  document,
  onDocument,
  onSchema,
  schema,
}: {
  document: string;
  onDocument: (v: string) => void;
  onSchema: (v: string) => void;
  schema: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <LabeledTextarea
        id="json-schema-input"
        label="JSON Schema"
        onChange={(e) => onSchema(e.target.value)}
        placeholder='e.g. {"type":"object","required":["name"]}'
        spellCheck={false}
        value={schema}
      />
      <LabeledTextarea
        id="json-document-input"
        label="JSON Document"
        onChange={(e) => onDocument(e.target.value)}
        placeholder='e.g. {"name":"Ada"}'
        spellCheck={false}
        value={document}
      />
    </div>
  );
}

export function JsonSchemaActions({
  computing,
  onCopyLink,
  onValidate,
}: {
  computing: boolean;
  onCopyLink: () => void;
  onValidate: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button isDisabled={computing} onPress={onValidate} size="sm">
        <FileCheck2 className="size-4" />
        Validate
      </Button>
      {computing && (
        <span aria-live="polite" className="text-muted-fg text-xs">
          Validating…
        </span>
      )}
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
    </div>
  );
}

export function JsonSchemaOutput({
  copied,
  hasInput,
  onCopy,
  result,
}: {
  copied: boolean;
  hasInput: boolean;
  onCopy: () => void;
  result: ValidationState | null;
}) {
  if (!hasInput) {
    return (
      <p className="text-muted-fg text-xs">
        Paste a schema and a document, then click Validate.
      </p>
    );
  }
  if (!result) {
    return null;
  }
  if (result.timedOut) {
    return <ToolError message={result.error} title="Validation timed out" />;
  }
  if (result.error) {
    return <ToolError message={result.error} title="Cannot validate" />;
  }
  if (result.isValid) {
    return (
      <div>
        <Badge intent="success" isCircle={false}>
          <Check className="size-3" />
          Valid — document satisfies the schema
        </Badge>
      </div>
    );
  }
  const value = result.issues
    .map((issue) => `${issue.path}: ${issue.message}`)
    .join('\n');
  return (
    <ResultPanel
      copied={copied}
      copyLabel="Copy issues"
      label={`Issues (${result.issues.length}${result.truncated ? '+' : ''})`}
      onCopy={onCopy}
      value={value}
    >
      <Badge intent="danger" isCircle={false}>
        <X className="size-3" />
        Invalid — {result.issues.length} issue
        {result.issues.length === 1 ? '' : 's'}
        {result.truncated ? ' shown (truncated)' : ''}
      </Badge>
    </ResultPanel>
  );
}

export function JsonSchemaHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Schemas are evaluated with JSON Schema draft 2020-12 semantics, including the standard string formats (email, date-time, uri, uuid, …). Draft-07 staples such as dependencies and $ref keep working, so schemas written for older drafts validate as you expect.',
          question: 'Which JSON Schema draft is supported?',
        },
        {
          answer:
            'Yes. Local $ref targets such as #/$defs/name resolve against the schema you pasted. Remote $refs (URLs) are not fetched — everything runs offline in your browser.',
          question: 'Does $ref work?',
        },
        {
          answer:
            'Both panes are validated — malformed JSON in either one is reported as an input problem ("Schema is not valid JSON") rather than a schema violation, so you always know which side to fix.',
          question: 'What is the difference between an error and an issue?',
        },
        {
          answer:
            'Yes. Validation compiles and runs locally in your browser via Web Worker — schema and document never leave your device.',
          question: 'Is my data safe?',
        },
      ]}
      howItWorks={{
        description:
          'Paste a JSON Schema on the left and the JSON document on the right, then validate.',
        steps: [
          'Paste the JSON Schema (object or boolean)',
          'Paste the JSON document to check',
          'Click Validate to run the check in a background worker',
          'Copy the issue list or share a link to the exact inputs',
        ],
      }}
    />
  );
}
