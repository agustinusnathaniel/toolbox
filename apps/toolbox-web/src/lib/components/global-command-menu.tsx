'use client';

import {
  IconBrandWhatsapp,
  IconCamera,
  IconCodeLines,
  IconGlobe,
  IconSearch,
} from '@intentui/icons';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import {
  CommandMenu,
  CommandMenuDescription,
  CommandMenuFooter,
  CommandMenuItem,
  CommandMenuLabel,
  CommandMenuList,
  CommandMenuSearch,
  CommandMenuSection,
} from '@/lib/components/ui/command-menu';
import { Input, InputGroup } from '@/lib/components/ui/input';
import { Text } from '@/lib/components/ui/text';
import { useIsMobile } from '@/lib/hooks/use-mobile';

const navigationItems = [
  {
    id: 'home',
    title: 'Home',
    description: 'Open toolbox catalog and tool overview',
    icon: IconGlobe,
    href: '/',
  },
  {
    id: 'wa-link-helper',
    title: 'WA Link Helper',
    description: 'Generate WhatsApp links quickly',
    icon: IconBrandWhatsapp,
    href: '/tools/wa-link-helper',
  },
  {
    id: 'zippy-img',
    title: 'Zippy Image',
    description: 'Compress images in browser',
    icon: IconCamera,
    href: '/tools/zippy-img',
  },
  {
    id: 'js-perf-comparator',
    title: 'JS Perf Comparator',
    description: 'Compare script runtime behavior',
    icon: IconCodeLines,
    href: '/tools/js-perf-comparator',
  },
];

const quickActions = [
  {
    id: 'open-home',
    title: 'Open Catalog',
    description: 'Go to homepage catalog',
    icon: IconGlobe,
    href: '/',
  },
  {
    id: 'open-wa-link-helper',
    title: 'Open WA Link Helper',
    description: 'Go to WhatsApp link tool',
    icon: IconBrandWhatsapp,
    href: '/tools/wa-link-helper',
  },
  {
    id: 'open-zippy-img',
    title: 'Open Zippy Image',
    description: 'Go to image compression tool',
    icon: IconCamera,
    href: '/tools/zippy-img',
  },
];

interface GlobalCommandMenuProps {
  children: React.ReactNode;
}

export const GlobalCommandMenu = ({ children }: GlobalCommandMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    navigate({ to: href });
  };

  return (
    <>
      <button
        aria-label="Open command menu"
        className="cursor-pointer"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        {children}
      </button>

      <CommandMenu
        aria-label="Command Menu"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        shortcut="k"
      >
        <CommandMenuSearch placeholder="Type a command or search..." />
        <CommandMenuList>
          <CommandMenuSection label="Navigation">
            {navigationItems.map((item) => (
              <CommandMenuItem
                key={item.id}
                onAction={() => handleNavigate(item.href)}
                textValue={item.title}
              >
                <item.icon />
                <CommandMenuLabel>{item.title}</CommandMenuLabel>
                <CommandMenuDescription>
                  {item.description}
                </CommandMenuDescription>
              </CommandMenuItem>
            ))}
          </CommandMenuSection>

          <CommandMenuSection label="Quick Actions">
            {quickActions.map((item) => (
              <CommandMenuItem
                key={item.id}
                onAction={() => handleNavigate(item.href)}
                textValue={item.title}
              >
                <item.icon />
                <CommandMenuLabel>{item.title}</CommandMenuLabel>
              </CommandMenuItem>
            ))}
          </CommandMenuSection>
        </CommandMenuList>
        {isMobile ? null : (
          <CommandMenuFooter>
            ↑↓ to navigate | ↵ to select | esc to close
          </CommandMenuFooter>
        )}
      </CommandMenu>
    </>
  );
};

export const CommandMenuTrigger = () => {
  return (
    <GlobalCommandMenu>
      <InputGroup className="w-40">
        <IconSearch />
        <Input placeholder="Search..." readOnly />
        <Text>⌘K</Text>
      </InputGroup>
    </GlobalCommandMenu>
  );
};
