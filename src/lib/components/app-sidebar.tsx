'use client';

import { RiArrowDownSLine, RiGlobalLine, RiTimeLine } from '@remixicon/react';
import { Link, useLocation } from '@tanstack/react-router';
import { useCallback } from 'react';

import { ThemeToggle } from '@/lib/components/theme-toggle';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/lib/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/lib/components/ui/sidebar';
import { usePrefetchRoute } from '@/lib/hooks/use-prefetch-route';
import { getToolNavCategories } from '@/lib/navigation/tool-registry';

const navCategories = getToolNavCategories();

export const AppSidebar = (props: React.ComponentProps<typeof Sidebar>) => {
  const { isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const prefetchRoute = usePrefetchRoute();

  const handleMobileClose = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleMobileClose}
              render={<Link to="/" />}
              tooltip="Toolbox home"
            >
              <RiGlobalLine aria-hidden="true" />
              <span className="font-medium">Toolbox</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navCategories.map(({ category, items }) => (
          <Collapsible defaultOpen key={category}>
            <SidebarGroup>
              {/* In icon-collapsed mode the label text hides but the trigger
                  stays mounted and focusable, so keyboard focus never lands
                  on a removed target. */}
              <SidebarGroupLabel render={<CollapsibleTrigger />}>
                <span className="min-w-0 flex-1 truncate group-data-[collapsible=icon]:hidden">
                  {category}
                </span>
                <RiArrowDownSLine
                  aria-hidden="true"
                  className="in-data-[panel-open]:rotate-180 transition-transform group-data-[collapsible=icon]:hidden"
                />
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.slug}>
                        <SidebarMenuButton
                          isActive={location.pathname === item.path}
                          onClick={handleMobileClose}
                          onFocus={() => prefetchRoute(item.path)}
                          onMouseEnter={() => prefetchRoute(item.path)}
                          render={<Link to={item.path} />}
                          tooltip={item.title}
                        >
                          {item.icon}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
        <SidebarSeparator className="mx-0" />
        <SidebarGroup>
          <SidebarGroupLabel>More</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname === '/changelog'}
                  onClick={handleMobileClose}
                  render={<Link to="/changelog" />}
                  tooltip="Changelog"
                >
                  <RiTimeLine aria-hidden="true" />
                  <span>Changelog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-row items-center justify-between gap-2 p-2">
        <ThemeToggle className="size-8" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
