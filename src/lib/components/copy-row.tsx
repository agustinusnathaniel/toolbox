import { Check, Copy } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';

interface CopyRowProps {
  copied?: boolean;
  copyLabel?: string;
  label: string;
  mono?: boolean;
  onCopy?: () => void;
  value: string | undefined;
}

export const CopyRow = ({
  copied,
  copyLabel,
  label,
  mono,
  onCopy,
  value,
}: CopyRowProps) => {
  if (!value) {
    return null;
  }
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-muted-fg text-sm">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`break-all text-right font-medium text-sm ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value}
        </span>
        {onCopy && copyLabel && (
          <Button
            aria-label={copyLabel}
            intent="outline"
            onPress={onCopy}
            size="sq-sm"
          >
            {copied ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
