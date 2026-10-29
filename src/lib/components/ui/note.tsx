import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiInformationFill,
} from '@remixicon/react';
import { cn } from 'cn';

export interface NoteProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  intent?: 'default' | 'info' | 'warning' | 'danger' | 'success';
  indicator?: boolean;
}

export function Note({
  indicator = true,
  intent = 'default',
  className,
  children,
  ...props
}: NoteProps) {
  const iconMap = {
    info: RiInformationFill,
    warning: RiErrorWarningFill,
    danger: RiErrorWarningFill,
    success: RiCheckboxCircleFill,
    default: null,
  } as const;

  const IconComponent = iconMap[intent];

  return (
    <div
      data-slot="note"
      className={cn(
        'grid w-full grid-cols-[auto_1fr] overflow-hidden rounded-lg border p-4 text-base/6 backdrop-blur-2xl sm:text-sm/6',
        '*:[a]:hover:underline **:[strong]:font-medium',
        intent === 'default' && 'border-border bg-muted/50 text-secondary-foreground',
        intent === 'info' &&
          'border-primary/15 bg-primary/10 text-primary **:[.text-muted-foreground]:text-primary/70',
        intent === 'warning' &&
          'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        intent === 'danger' &&
          'border-destructive/15 bg-destructive/10 text-destructive',
        intent === 'success' &&
          'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        className
      )}
      {...props}
    >
      {IconComponent && indicator ? (
        <div className="me-3 grid size-8 place-content-center">
          <IconComponent aria-hidden="true" className="size-5" />
        </div>
      ) : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
