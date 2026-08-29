'use client';

import { ArrowLeftRight, GitCompare, Link } from 'lucide-react';

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
  );
}
