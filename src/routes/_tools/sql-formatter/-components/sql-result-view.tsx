import { CopyButton } from '@/lib/components/copy-button';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
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
        <CopyButton
          copied={copiedKey === 'copy'}
          disabled={!(result?.isValid && result.formatted) || result.timedOut}
          label="Copy output"
          onPress={onCopy}
          text="Copy output"
        />
        <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
      </div>

      {input.trim() && !result && !computing && (
        <p className="text-muted-fg text-xs">
          Click {action === 'minify' ? 'Minify' : 'Format'} to{' '}
          {action === 'minify' ? 'compress your SQL' : 'beautify your SQL'}.
        </p>
      )}

      {result && !result.isValid && !result.timedOut && (
        <ToolError message={result.error} title="Formatting failed" />
      )}

      {result?.timedOut && (
        <ToolError message={result.error} title="Formatting timed out" />
      )}

      {result?.isValid && result.formatted && (
        <ResultPanel
          copied={copiedKey === 'copy'}
          label="Output"
          onCopy={onCopy}
          value={result.formatted}
        />
      )}
    </>
  );
}
