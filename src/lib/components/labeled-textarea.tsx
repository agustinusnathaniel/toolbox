import type { ComponentProps } from 'react';

import { Textarea } from '@/lib/components/ui/textarea';

interface LabeledTextareaProps extends ComponentProps<typeof Textarea> {
  label: string;
}

export function LabeledTextarea({
  className = 'min-h-40 font-mono',
  label,
  ...props
}: LabeledTextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor={props.id}>
        {label}
      </label>
      <Textarea className={className} {...props} />
    </div>
  );
}
