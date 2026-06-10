import { useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
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

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const {
    location: { pathname },
  } = useRouterState();
  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" intent="inset" />
      <SidebarInset className="mb-16 min-h-[95dvh] md:mb-0">
        <AppSidebarNav />
        <div
          className={twMerge(
            isMobile ? 'pb-16' : 'route-transition',
            'p-4 lg:p-6'
          )}
          key={pathname}
        >
          {children}
        </div>
        <Footer />
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
};
