'use client';

import { IconGlobe, IconSearch } from '@intentui/icons';
import type { ToOptions } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

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
import { getToolNavItems } from '@/lib/navigation/tool-registry';

const toolNavItems = getToolNavItems();

interface GlobalCommandMenuProps {
  children: React.ReactNode;
}

const GlobalCommandMenu = ({ children }: GlobalCommandMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNavigate = useCallback(
    (path: ToOptions['to']) => {
      setIsOpen(false);
      navigate({ to: path });
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
            <CommandMenuItem
              onAction={() => handleNavigate('/')}
              textValue="Home"
            >
              <IconGlobe />
              <CommandMenuLabel>Home</CommandMenuLabel>
              <CommandMenuDescription className="col-start-2 row-start-2 ms-0">
                Open toolbox catalog and tool overview
              </CommandMenuDescription>
            </CommandMenuItem>
            {toolNavItems.map((item) => (
              <CommandMenuItem
                key={item.slug}
                onAction={() => handleNavigate(item.path)}
                textValue={item.title}
              >
                {item.icon}
                <CommandMenuLabel>{item.title}</CommandMenuLabel>
                <CommandMenuDescription className="col-start-2 row-start-2 ms-0">
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

export const CommandMenuTrigger = () => (
  <GlobalCommandMenu>
    <InputGroup className="w-40">
      <IconSearch />
      <Input placeholder="Search..." readOnly />
      <Text>⌘K</Text>
    </InputGroup>
  </GlobalCommandMenu>
);
