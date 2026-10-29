'use client';

import { CopyButton } from '@/lib/components/copy-button';
import { CopyLinkButton } from '@/lib/components/copy-link-button';

export function RegexActions({
  onCopyLink,
  onCopyMatches,
  copiedKey,
  disabled,
}: {
  onCopyLink: () => void;
  onCopyMatches: () => void;
  copiedKey: string | null;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyLinkButton label="Copy shareable link" onClick={onCopyLink} />
      <CopyButton
        copied={copiedKey === 'matches'}
        disabled={disabled}
        label="Copy matches"
        onClick={onCopyMatches}
        text="Copy matches"
      />
    </div>
  );
}
