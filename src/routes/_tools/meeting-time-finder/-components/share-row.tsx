import { useCallback, useState } from 'react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { Button } from '@/lib/components/ui/button';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';

interface ShareRowProps {
  onCopy: () => void;
  shareableParams: URLSearchParams;
  trackAction: (action: string) => void;
}

export function ShareRow({
  onCopy,
  shareableParams,
  trackAction,
}: ShareRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [onCopy]);

  const handleCopyLink = useCopyShareableLink(
    () => shareableParams,
    trackAction
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handleCopy} size="sm" variant="outline">
        {copied ? 'Copied!' : 'Copy Times'}
      </Button>
      <CopyLinkButton onClick={handleCopyLink} />
    </div>
  );
}
