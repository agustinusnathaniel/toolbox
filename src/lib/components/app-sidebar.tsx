'use client';

import { IconClock, IconGlobe, IconMoon, IconSun } from '@intentui/icons';
import { useLocation } from '@tanstack/react-router';
import { Folder } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import { Button } from '@/lib/components/ui/button';
import { Link } from '@/lib/components/ui/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarSection,
  SidebarSectionGroup,
  SidebarTree,
  SidebarTreeContent,
  SidebarTreeItem,
  SidebarTreeLabel,
  SidebarTreeLink,
  useSidebar,
} from '@/lib/components/ui/sidebar';
import { useIsMobile } from '@/lib/hooks/use-mobile';
import { getToolNavCategories } from '@/lib/navigation/tool-registry';

const navCategories = getToolNavCategories();

export const AppSidebar = (props: React.ComponentProps<typeof Sidebar>) => {
  const { setIsOpenOnMobile } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  const handleMobileClose = useCallback(() => {
    if (isMobile) {
      setIsOpenOnMobile(false);
    }
  }, [isMobile, setIsOpenOnMobile]);

  return (
    <Sidebar {...props}>
      <nav
        aria-label="Tool navigation"
        className="flex min-h-0 flex-1 flex-col"
      >
        <SidebarHeader>
          <Link
            className="flex items-center gap-x-2 group-data-[collapsible=dock]:size-10 group-data-[collapsible=dock]:justify-center"
            href="/"
            onClick={handleMobileClose}
          >
            <IconGlobe className="size-5" />
            <SidebarLabel className="font-medium">Toolbox</SidebarLabel>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarSectionGroup>
            <SidebarTree
              defaultExpandedKeys={navCategories.map(
                ({ category }) => category
              )}
              selectedRoute={location.pathname}
            >
              {navCategories.map(({ category, items }) => (
                <SidebarTreeItem
                  id={category}
                  key={category}
                  textValue={category}
                >
                  <SidebarTreeContent className="font-semibold">
                    <Folder aria-hidden="true" />
                    <SidebarTreeLabel>{category}</SidebarTreeLabel>
                  </SidebarTreeContent>
                  {items.map((item) => (
                    <SidebarTreeItem
                      href={item.path}
                      id={item.slug}
                      key={item.slug}
                      textValue={item.title}
                    >
                      <SidebarTreeContent>
                        <SidebarTreeLink onPress={handleMobileClose}>
                          {item.icon}
                          <SidebarTreeLabel>{item.title}</SidebarTreeLabel>
                        </SidebarTreeLink>
                      </SidebarTreeContent>
                    </SidebarTreeItem>
                  ))}
                </SidebarTreeItem>
              ))}
            </SidebarTree>
            <SidebarSection label="More">
              <SidebarItem
                href="/changelog"
                isCurrent={location.pathname === '/changelog'}
                onClick={handleMobileClose}
                tooltip="Changelog"
              >
                <IconClock />
                <SidebarLabel>Changelog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarSectionGroup>
        </SidebarContent>

        <SidebarFooter className="flex flex-row items-center justify-between gap-2 p-2">
          <Button
            aria-label="Toggle theme"
            className="size-8"
            intent="plain"
            onPress={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
          >
            {/* Both icons are rendered and toggled via CSS so the markup is
              identical on server and client (theme is unknown at SSR time). */}
            <IconMoon aria-hidden="true" className="dark:hidden" />
            <IconSun aria-hidden="true" className="hidden dark:block" />
          </Button>
        </SidebarFooter>
      </nav>
      <SidebarRail />
    </Sidebar>
  );
};
