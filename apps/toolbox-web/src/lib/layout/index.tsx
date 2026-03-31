import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { AppSidebar } from '@/lib/components/app-sidebar';
import { AppSidebarNav } from '@/lib/components/app-sidebar-nav';
import { SidebarInset, SidebarProvider } from '@/lib/components/ui/sidebar';
import { useIsMobile } from '@/lib/hooks/use-mobile';

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" intent="inset" />
      <SidebarInset>
        <AppSidebarNav />
        <div
          className={twMerge(isMobile ? '' : 'route-transition', 'p-4 lg:p-6')}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
