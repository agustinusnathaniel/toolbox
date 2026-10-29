'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/lib/components/ui/breadcrumb';
import { SidebarTrigger } from '@/lib/components/ui/sidebar';

import { CommandMenuTrigger } from './global-command-menu';

export const AppSidebarNav = () => (
  <header className="sticky top-0 z-5 flex items-center justify-between gap-2 rounded-t-2xl bg-muted/80 p-2 backdrop-blur-xs">
    <span className="flex items-center gap-x-4">
      <SidebarTrigger />
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Toolbox</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </span>
    <span className="flex items-center gap-x-4">
      <CommandMenuTrigger />
    </span>
  </header>
);
