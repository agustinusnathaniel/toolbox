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
    <span
      aria-hidden="true"
      className="relative grid size-4 place-items-center"
    >
      <Copy
        aria-hidden="true"
        className={`col-start-1 row-start-1 size-4 transition-all duration-200 [transition-timing-function:cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none ${
          copied
            ? 'scale-25 opacity-0 blur-[4px]'
            : 'scale-100 opacity-100 blur-none'
        }`}
      />
      <Check
        aria-hidden="true"
        className={`col-start-1 row-start-1 size-4 text-success transition-all duration-200 [transition-timing-function:cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none ${
          copied
            ? 'scale-100 opacity-100 blur-none'
            : 'scale-25 opacity-0 blur-[4px]'
        }`}
      />
    </span>
    {text}
  </Button>
);
