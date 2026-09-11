'use client';

import { ArrowLeftRight, GitCompare } from 'lucide-react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { Button } from '@/lib/components/ui/button';

type DiffActionsProps = {
  computing: boolean;
  onCompare: () => void;
  onSwap: () => void;
  onCopyLink: () => void;
};

export function DiffActions({
  computing,
  onCompare,
  onSwap,
  onCopyLink,
}: DiffActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onPress={onCompare} size="sm">
        <GitCompare className="size-4" />
        Compare
      </Button>
      {computing && (
        <span aria-live="polite" className="text-muted-fg text-xs">
          Comparing…
        </span>
      )}
      <Button intent="outline" onPress={onSwap} size="sm">
        <ArrowLeftRight className="size-4" />
        Swap
      </Button>
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
    </div>
  );
}
