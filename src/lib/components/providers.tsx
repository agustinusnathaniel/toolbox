'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';

import { TooltipProvider } from '@/lib/components/ui/tooltip';

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <NextThemeProvider
    attribute="class"
    defaultTheme="system"
    storageKey="vite-ui-theme"
  >
    <TooltipProvider>{children}</TooltipProvider>
  </NextThemeProvider>
);
