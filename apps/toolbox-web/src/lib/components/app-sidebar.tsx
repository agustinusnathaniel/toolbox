'use client';

import {
  IconBrandWhatsapp,
  IconCamera,
  IconCodeLines,
  IconGlobe,
  IconMoon,
  IconSun,
} from '@intentui/icons';
import { type ToOptions, useLocation } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { useTheme } from '@/lib/components/theme-provider';
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

export const AppSidebar = (props: React.ComponentProps<typeof Sidebar>) => {
  const { setIsOpenOnMobile } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const handleMobileClose = () => {
    if (isMobile) {
      setIsOpenOnMobile(false);
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link
          className="flex items-center gap-x-2 group-data-[collapsible=dock]:size-10 group-data-[collapsible=dock]:justify-center"
          href="/"
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
                href={item.href}
                isCurrent={location.pathname === item.href}
                key={item.label}
                onClick={handleMobileClose}
                tooltip={item.label}
              >
                {item.icon}
                <SidebarLabel>{item.label}</SidebarLabel>
              </SidebarItem>
            ))}
          </SidebarSection>
        </SidebarSectionGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-row items-center justify-between gap-2 p-2">
        <Button
          className="size-8"
          intent="plain"
          onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

const navigation: Array<{
  label: string;
  icon?: ReactNode;
  href?: ToOptions['to'];
}> = [
  {
    label: 'WA Link Helper',
    href: '/tools/wa-link-helper',
    icon: <IconBrandWhatsapp />,
  },
  {
    label: 'Zippy Image',
    href: '/tools/zippy-img',
    icon: <IconCamera />,
  },
  {
    label: 'JS Perf Comparator',
    href: '/tools/js-perf-comparator',
    icon: <IconCodeLines />,
  },
];
