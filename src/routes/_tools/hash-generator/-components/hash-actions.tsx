'use client';

import { Fingerprint } from 'lucide-react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
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
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
    </div>
  );
}
