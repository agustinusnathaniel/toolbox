'use client';

import { IconGlobe, IconSearch, IconStar } from '@intentui/icons';
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
import { InputGroup } from '@/lib/components/ui/input';
import { Text } from '@/lib/components/ui/text';
import { useIsMobile } from '@/lib/hooks/use-mobile';
import { usePinnedTools } from '@/lib/hooks/use-pinned-tools';
import { getToolNavItems } from '@/lib/navigation/tool-registry';

const toolNavItems = getToolNavItems();

interface GlobalCommandMenuProps {
  children: React.ReactNode;
}

const GlobalCommandMenu = ({ children }: GlobalCommandMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { pinnedSlugs } = usePinnedTools();

  const pinnedNavItems = toolNavItems.filter((item) =>
    pinnedSlugs.includes(item.slug)
  );

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
        className="group cursor-pointer"
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
          {pinnedNavItems.length > 0 && (
            <CommandMenuSection label="Pinned">
              {pinnedNavItems.map((item) => (
                <CommandMenuItem
                  key={item.slug}
                  onAction={() => handleNavigate(item.path)}
                  textValue={item.title}
                >
                  <IconStar />
                  <CommandMenuLabel>{item.title}</CommandMenuLabel>
                  <CommandMenuDescription className="col-start-2 row-start-2 ms-0">
                    {item.description}
                  </CommandMenuDescription>
                </CommandMenuItem>
              ))}
            </CommandMenuSection>
          )}
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
    <InputGroup className="flex h-9 w-40 items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-muted-fg transition-colors group-hover:border-muted-fg/50 group-focus-visible:border-ring/70 group-focus-visible:ring-3 group-focus-visible:ring-ring/20">
      <IconSearch aria-hidden="true" data-slot="icon" />
      <span className="min-w-0 flex-1 truncate text-start text-sm">
        Search...
      </span>
      <Text className="text-muted-fg text-xs">⌘K</Text>
    </InputGroup>
  </GlobalCommandMenu>
);
