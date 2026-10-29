import { Link } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';

interface CopyLinkButtonProps {
  label?: string;
  onClick: () => void;
}

export const CopyLinkButton = ({ label, onClick }: CopyLinkButtonProps) => (
  <Button aria-label={label} onClick={onClick} size="sm" variant="outline">
    <Link aria-hidden="true" className="size-4" />
    Copy link
  </Button>
);
