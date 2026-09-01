import { Check, Copy, Link } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import type { SqlSearchAction } from '@/lib/tools/sql-formatter/adapters/sql-params';

import type { UseSqlFormatterReturn } from './use-sql-formatter';

interface SqlResultViewProps {
  action: SqlSearchAction;
  computing: boolean;
  copiedKey: string | null;
  input: string;
  onCopy: () => void;
  onCopyLink: () => void;
  result: UseSqlFormatterReturn['result'];
}

export function SqlResultView({
  action,
  copiedKey,
  computing,
  input,
  onCopy,
  onCopyLink,
  result,
}: SqlResultViewProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          aria-label="Copy output"
          intent="outline"
          isDisabled={!(result?.isValid && result.formatted) || result.timedOut}
          onPress={onCopy}
          size="sm"
        >
          {copiedKey === 'copy' ? (
            <Check className="size-4 text-success" />
          ) : (
            <Copy className="size-4" />
          )}
          Copy output
        </Button>
        <Button
          aria-label="Copy shareable link"
          intent="outline"
          onPress={onCopyLink}
          size="sm"
        >
          <Link className="size-4" />
          Copy link
        </Button>
      </div>

      {input.trim() && !result && !computing && (
        <p className="text-muted-fg text-xs">
          Click {action === 'minify' ? 'Minify' : 'Format'} to{' '}
          {action === 'minify' ? 'compress your SQL' : 'beautify your SQL'}.
        </p>
      )}

      {result && !result.isValid && !result.timedOut && (
        <div
          className="rounded-lg border border-danger/30 bg-danger/5 p-3"
          role="alert"
        >
          <p className="font-medium text-danger text-sm">Formatting failed</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
            {result.error}
          </pre>
        </div>
      )}

      {result?.timedOut && (
        <div
          className="rounded-lg border border-danger/30 bg-danger/5 p-3"
          role="alert"
        >
          <p className="font-medium text-danger text-sm">
            Formatting timed out
          </p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
            {result.error}
          </pre>
        </div>
      )}

      {result?.isValid && result.formatted && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-fg text-sm">Output</span>
            <Button
              aria-label="Copy result"
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
          <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
            {result.formatted}
          </pre>
        </div>
      )}
    </>
  );
}
