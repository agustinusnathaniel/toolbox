'use client';

import { Breadcrumbs, BreadcrumbsItem } from '@/lib/components/ui/breadcrumbs';
import { SidebarNav, SidebarTrigger } from '@/lib/components/ui/sidebar';

import { CommandMenuTrigger } from './global-command-menu';

export const AppSidebarNav = () => {
  return (
    <SidebarNav className="sticky top-0 z-5 rounded-t-2xl bg-overlay/80 backdrop-blur-xs">
      <span className="flex items-center gap-x-4">
        <SidebarTrigger />
        <Breadcrumbs className="hidden md:flex">
          <BreadcrumbsItem href="/">Toolbox</BreadcrumbsItem>
        </Breadcrumbs>
      </span>
      <span className="flex items-center gap-x-4">
        <CommandMenuTrigger />
      </span>
    </SidebarNav>
  );
};
