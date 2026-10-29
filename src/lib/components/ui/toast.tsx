'use client';

import { useTheme } from 'next-themes';
import { Toaster as ToasterPrimitive, type ToasterProps } from 'sonner';

export function Toast(props: ToasterProps) {
  const { theme = 'system' } = useTheme();
  return (
    <ToasterPrimitive
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      richColors
      toastOptions={{
        className:
          'not-has-data-[slot=note]:backdrop-blur-3xl will-change-transform *:data-[slot=note]:relative *:data-[slot=note]:z-50 *:data-icon:mt-0.5 *:data-icon:self-start has-data-description:*:data-icon:mt-1',
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',

          '--success-bg': 'var(--success-bg)',
          '--success-border': 'var(--success-border)',
          '--success-text': 'var(--success-text)',

          '--error-bg': 'var(--error-bg)',
          '--error-border': 'var(--error-border)',
          '--error-text': 'var(--error-text)',

          '--warning-bg': 'var(--warning-bg)',
          '--warning-border': 'var(--warning-border)',
          '--warning-text': 'var(--warning-text)',

          '--info-bg': 'var(--info-bg)',
          '--info-border': 'var(--info-border)',
          '--info-text': 'var(--info-text)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
