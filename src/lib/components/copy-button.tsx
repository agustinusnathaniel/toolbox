import { Check, Copy } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';

interface CopyButtonProps {
  copied: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  text?: string;
}

export const CopyButton = ({
  copied,
  disabled,
  label,
  onPress,
  text,
}: CopyButtonProps) => (
  <Button
    aria-label={label}
    intent="outline"
    isDisabled={disabled}
    onPress={onPress}
    size={text ? 'sm' : 'sq-sm'}
  >
    {copied ? (
      <Check className="size-4 text-success" />
    ) : (
      <Copy className="size-4" />
    )}
    {text}
  </Button>
);
