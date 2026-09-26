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
    {/* Matches the SidebarTrigger beside it at BOTH breakpoints. The trigger
        is 40px/18px icon below sm: and 32px/16px from sm: up, so both the
        frame and the icon have to be breakpoint-aware — a single size makes
        one of the two match and the other mismatch. */}
    <InputGroup className="flex size-10 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-fg transition-colors group-hover:text-fg group-focus-visible:ring-3 group-focus-visible:ring-ring/20 sm:h-8 sm:w-40 sm:justify-start sm:gap-2 sm:border sm:border-input sm:px-3 sm:group-focus-visible:border-ring/70">
      {/* InputGroup's own `*:data-[slot=icon]:size-5` compiles to a class +
          attribute selector, which outranks a plain size utility — hence `!`. */}
      <IconSearch
        aria-hidden="true"
        className="!size-4.5 sm:!size-4 shrink-0"
        data-slot="icon"
      />
      {/* Text and the ⌘K hint are desktop-only: on a phone the bar is width-constrained
          and ⌘K does not exist on Android/iOS keyboards. */}
      <span className="hidden min-w-0 flex-1 truncate text-start text-sm sm:block">
        Search...
      </span>
      <Text className="hidden text-muted-fg text-xs sm:block">⌘K</Text>
    </InputGroup>
  </GlobalCommandMenu>
);
