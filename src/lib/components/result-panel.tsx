import type { ReactNode } from 'react';

import { CopyButton } from '@/lib/components/copy-button';

interface ResultPanelProps {
  children?: ReactNode;
  copied: boolean;
  copyLabel?: string;
  label: string;
  onCopy: () => void;
  value: string;
}

export const ResultPanel = ({
  children,
  copied,
  copyLabel = 'Copy result',
  label,
  onCopy,
  value,
}: ResultPanelProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-muted-fg text-sm">{label}</span>
      <CopyButton copied={copied} label={copyLabel} onPress={onCopy} />
    </div>
    {children}
    <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
      {value}
    </pre>
  </div>
);
