'use client';

import { CopyButton } from '@/lib/components/copy-button';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import type { UuidResult } from '@/lib/tools/uuid-generator/adapters/uuid-generator';

export function UuidResults({
  copiedKey,
  onCopy,
  onCopyAll,
  onCopyLink,
  result,
}: {
  copiedKey: number | string | null;
  onCopy: (uuid: string, index: number) => void;
  onCopyAll: () => void;
  onCopyLink: () => void;
  result: UuidResult | null;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {result?.isValid && result.uuids.length > 1 && (
          <Button onClick={onCopyAll} size="sm" variant="outline">
            Copy all
          </Button>
        )}
        <CopyLinkButton label="Copy shareable link" onClick={onCopyLink} />
      </div>
      {result && !result.isValid && (
        <p className="text-destructive text-sm" role="alert">
          {result.error}
        </p>
      )}
      {result?.isValid && result.uuids.length > 0 && (
        <ol className="flex max-h-96 flex-col gap-2 overflow-auto">
          {result.uuids.map((uuid, index) => (
            <li
              className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 p-3"
              key={uuid}
            >
              <code className="min-w-0 truncate font-mono text-sm">{uuid}</code>
              <CopyButton
                copied={copiedKey === index}
                label={`Copy UUID ${index + 1}`}
                onClick={() => onCopy(uuid, index)}
              />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

export function UuidHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'No. UUIDs are generated entirely in your browser using the native Web Crypto API. Nothing leaves your device.',
          question: 'Is my data sent anywhere?',
        },
        {
          answer:
            'UUID v4 is fully random. UUID v7 encodes the current timestamp in the first bytes, so values are roughly time-ordered, which can improve database index locality.',
          question: 'What is the difference between v4 and v7?',
        },
      ]}
      howItWorks={{
        description:
          'Pick a version, choose how many UUIDs you need, and copy them individually or all at once.',
        steps: [
          'Select UUID v4 or v7',
          'Set the count (1-1000) and formatting options',
          'Click Generate',
          'Copy a single UUID or copy all',
        ],
      }}
    />
  );
}
