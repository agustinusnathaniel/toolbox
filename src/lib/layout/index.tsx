import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import { twMerge } from 'tailwind-merge';

import { AppSidebar } from '@/lib/components/app-sidebar';
import { AppSidebarNav } from '@/lib/components/app-sidebar-nav';
import { MobileBottomNav } from '@/lib/components/mobile-bottom-nav';
import { SidebarInset, SidebarProvider } from '@/lib/components/ui/sidebar';
import { useIsMobile } from '@/lib/hooks/use-mobile';

import { Footer } from './components/footer';

type LayoutProps = {
  children: ReactNode;
};

// Dev-only navigation-data toggle (?data=worst). Lazy so production bundles
// never include it.
const DevDataToggle = import.meta.env.DEV
  ? lazy(() =>
      import('@/lib/components/dev-data-toggle').then((m) => ({
        default: m.DevDataToggle,
      }))
    )
  : () => null;

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider>
      <a
        className="sr-only z-50 rounded-lg bg-background px-4 py-2 font-medium text-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        href="#main-content"
      >
        Skip to content
      </a>
      <AppSidebar collapsible="icon" variant="inset" />
      <SidebarInset className="mb-16 min-h-[95dvh] md:mb-0">
        <AppSidebarNav />
        <div
          className={twMerge(
            isMobile ? 'pb-16' : 'route-transition',
            'p-4 lg:p-6'
          )}
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </div>
        <Footer />
      </SidebarInset>
      <MobileBottomNav />
      {import.meta.env.DEV ? (
        <Suspense fallback={null}>
          <DevDataToggle />
        </Suspense>
      ) : null}
    </SidebarProvider>
  );
};
