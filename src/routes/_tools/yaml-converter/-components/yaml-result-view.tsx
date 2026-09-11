import { CopyButton } from '@/lib/components/copy-button';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import type { YamlMode } from '@/lib/tools/yaml-converter/adapters/yaml-params';

import type { UseYamlConverterReturn } from './use-yaml-converter';

interface YamlResultViewProps {
  computing: boolean;
  copiedKey: string | null;
  input: string;
  mode: YamlMode;
  onCopy: () => void;
  onCopyLink: () => void;
  result: UseYamlConverterReturn['result'];
}

export function YamlResultView({
  copiedKey,
  computing,
  input,
  mode,
  onCopy,
  onCopyLink,
  result,
}: YamlResultViewProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <CopyButton
          copied={copiedKey === 'copy'}
          disabled={!(result?.isValid && result.output) || result.timedOut}
          label="Copy output"
          onPress={onCopy}
          text="Copy output"
        />
        <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
      </div>

      {input.trim() && !result && !computing && (
        <p className="text-muted-fg text-xs">
          Click Convert to{' '}
          {mode === 'json-to-yaml'
            ? 'turn JSON into YAML'
            : 'turn YAML into JSON'}
          .
        </p>
      )}

      {result && !result.isValid && !result.timedOut && (
        <ToolError message={result.error} title="Conversion failed" />
      )}

      {result?.timedOut && (
        <ToolError message={result.error} title="Conversion timed out" />
      )}

      {result?.isValid && result.output && (
        <ResultPanel
          copied={copiedKey === 'copy'}
          label="Output"
          onCopy={onCopy}
          value={result.output}
        />
      )}
    </>
  );
}
