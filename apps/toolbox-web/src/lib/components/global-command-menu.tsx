'use client';

import {
  IconBrandWhatsapp,
  IconCamera,
  IconCodeLines,
  IconDeviceDesktop,
  IconGlobe,
  IconQrCode,
  IconSearch,
} from '@intentui/icons';
import { type ToOptions, useNavigate } from '@tanstack/react-router';
import { type FC, type SVGProps, useCallback, useState } from 'react';

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

const navigationItems: Array<{
  id: string;
  title: string;
  description: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  href: ToOptions['to'];
}> = [
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
    href: '/wa-link-helper',
  },
  {
    id: 'zippy-img',
    title: 'Zippy Image',
    description: 'Compress images in browser',
    icon: IconCamera,
    href: '/zippy-img',
  },
  {
    id: 'js-perf-comparator',
    title: 'JS Perf Comparator',
    description: 'Compare script runtime behavior',
    icon: IconCodeLines,
    href: '/js-perf-comparator',
  },
  {
    id: 'ua-check',
    title: 'UA Check',
    description: 'Check your browser user agent info',
    icon: IconDeviceDesktop,
    href: '/ua-check',
  },
  {
    id: 'qrcode-generator',
    title: 'QR Code Generator',
    description: 'Generate QR codes for URL or vCard',
    icon: IconQrCode,
    href: '/qrcode-generator',
  },
];

interface GlobalCommandMenuProps {
  children: React.ReactNode;
}

export const GlobalCommandMenu = ({ children }: GlobalCommandMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNavigate = useCallback(
    (href: ToOptions['to']) => {
      setIsOpen(false);
      navigate({ to: href });
    },
    [navigate]
  );

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
