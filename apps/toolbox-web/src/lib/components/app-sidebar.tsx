'use client';

import { IconClock, IconGlobe, IconMoon, IconSun } from '@intentui/icons';
import { useLocation } from '@tanstack/react-router';
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
  useSidebar,
} from '@/lib/components/ui/sidebar';
import { useIsMobile } from '@/lib/hooks/use-mobile';
import { getToolNavItems } from '@/lib/navigation/tool-registry';

const navigation = getToolNavItems();

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
          <SidebarSection label="Tools">
            {navigation.map((item) => (
              <SidebarItem
                href={item.path}
                isCurrent={location.pathname === item.path}
                key={item.slug}
                onClick={handleMobileClose}
                tooltip={item.title}
              >
                {item.icon}
                <SidebarLabel>{item.title}</SidebarLabel>
              </SidebarItem>
            ))}
          </SidebarSection>
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
          className="size-8"
          intent="plain"
          onPress={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {resolvedTheme === 'dark' ? <IconSun /> : <IconMoon />}
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
