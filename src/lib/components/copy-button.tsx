import { Check, Copy } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';

interface CopyButtonProps {
  copied: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  text?: string;
}

export const CopyButton = ({
  copied,
  disabled,
  label,
  onClick,
  text,
}: CopyButtonProps) => (
  <Button
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    size={text ? 'sm' : 'icon-sm'}
    variant="outline"
  >
    <span
      aria-hidden="true"
      className="relative grid size-4 place-items-center"
    >
      <Copy
        aria-hidden="true"
        className={`col-start-1 row-start-1 size-4 transition-[transform,opacity,filter] duration-200 [transition-timing-function:cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none ${
          copied
            ? 'scale-25 opacity-0 blur-[4px]'
            : 'scale-100 opacity-100 blur-none'
        }`}
      />
      <Check
        aria-hidden="true"
        className={`col-start-1 row-start-1 size-4 text-emerald-600 transition-[transform,opacity,filter] duration-200 [transition-timing-function:cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none ${
          copied
            ? 'scale-100 opacity-100 blur-none'
            : 'scale-25 opacity-0 blur-[4px]'
        }`}
      />
    </span>
    {text}
  </Button>
);
