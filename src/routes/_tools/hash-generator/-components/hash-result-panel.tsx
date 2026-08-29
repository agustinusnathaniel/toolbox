'use client';

import { Check, Copy, X } from 'lucide-react';

import { Badge } from '@/lib/components/ui/badge';
import { Button } from '@/lib/components/ui/button';
import type { HashResult } from '@/lib/tools/hash-generator/adapters/hash-generator';
import { compareDigests } from '@/lib/tools/hash-generator/adapters/hash-generator';

export function HashError({ result }: { result: HashResult | null }) {
  if (result?.isValid) {
    return null;
  }
  if (!result) {
    return null;
  }
  return (
    <div
      className="rounded-lg border border-danger/30 bg-danger/5 p-3"
      role="alert"
    >
      <p className="font-medium text-danger text-sm">Nothing to hash</p>
      <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
        {result.error}
      </pre>
    </div>
  );
}

export function HashResultPanel({
  result,
  fileName,
  expected,
  copiedKey,
  onCopy,
}: {
  result: HashResult | null;
  fileName: string | null;
  expected: string;
  copiedKey: string | null;
  onCopy: () => void;
}) {
  if (!result?.isValid) {
    return null;
  }
  const isMatch = expected.trim()
    ? compareDigests(result.output, expected)
    : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-fg text-sm">{fileName ?? 'Hash'}</span>
        <Button
          aria-label="Copy hash"
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
      {isMatch !== null &&
        expected.trim() &&
        (isMatch ? (
          <Badge intent="success" isCircle={false}>
            <Check className="size-3" />
            Match — digest matches
          </Badge>
        ) : (
          <Badge intent="danger" isCircle={false}>
            <X className="size-3" />
            Mismatch — does not match
          </Badge>
        ))}
      <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
        {result.output}
      </pre>
    </div>
  );
}
