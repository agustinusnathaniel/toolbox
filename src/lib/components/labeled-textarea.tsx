import type { ComponentProps } from 'react';

import { Field, FieldLabel } from '@/lib/components/ui/field';
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
    <Field>
      <FieldLabel htmlFor={props.id}>{label}</FieldLabel>
      <Textarea className={className} {...props} />
    </Field>
  );
}
