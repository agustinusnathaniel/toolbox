import { Link } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';

interface CopyLinkButtonProps {
  label?: string;
  onPress: () => void;
}

export const CopyLinkButton = ({ label, onPress }: CopyLinkButtonProps) => (
  <Button aria-label={label} intent="outline" onPress={onPress} size="sm">
    <Link className="size-4" />
    Copy link
  </Button>
);
