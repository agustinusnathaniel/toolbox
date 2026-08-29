'use client';

import { Fingerprint, Link } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';

export function HashActions({
  onHashText,
  onCopyLink,
}: {
  onHashText: () => void;
  onCopyLink: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onPress={onHashText} size="sm">
        <Fingerprint className="size-4" />
        Hash text
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
