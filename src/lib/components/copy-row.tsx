import { CopyButton } from '@/lib/components/copy-button';

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
          <CopyButton
            copied={copied ?? false}
            label={copyLabel}
            onPress={onCopy}
          />
        )}
      </div>
    </div>
  );
};
