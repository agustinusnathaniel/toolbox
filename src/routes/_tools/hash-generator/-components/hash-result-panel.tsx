'use client';

import { Check, X } from 'lucide-react';

import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import { Badge } from '@/lib/components/ui/badge';
import type { HashResult } from '@/lib/tools/hash-generator/adapters/hash-generator';
import { compareDigests } from '@/lib/tools/hash-generator/adapters/hash-generator';

export function HashError({ result }: { result: HashResult | null }) {
  if (result?.isValid) {
    return null;
  }
  if (!result) {
    return null;
  }
  return <ToolError message={result.error} title="Nothing to hash" />;
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
    <ResultPanel
      copied={copiedKey === 'copy'}
      copyLabel="Copy hash"
      label={fileName ?? 'Hash'}
      onCopy={onCopy}
      value={result.output}
    >
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
    </ResultPanel>
  );
}
