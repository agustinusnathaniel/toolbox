'use client';

import { Check, Copy, Link } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';

export function RegexActions({
  onCopyLink,
  onCopyMatches,
  copiedMatches,
  disabled,
}: {
  onCopyLink: () => void;
  onCopyMatches: () => void;
  copiedMatches: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        aria-label="Copy shareable link"
        intent="outline"
        onPress={onCopyLink}
        size="sm"
      >
        <Link className="size-4" />
        Copy link
      </Button>
      <Button
        aria-label="Copy matches"
        intent="outline"
        isDisabled={disabled}
        onPress={onCopyMatches}
        size="sm"
      >
        {copiedMatches ? (
          <Check className="size-4 text-success" />
        ) : (
          <Copy className="size-4" />
        )}
        Copy matches
      </Button>
    </div>
  );
}
