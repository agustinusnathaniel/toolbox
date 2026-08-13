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
import { Input, InputGroup } from '@/lib/components/ui/input';
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
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { pinnedSlugs } = usePinnedTools();

  const pinnedNavItems = toolNavItems.filter((item) =>
    pinnedSlugs.includes(item.slug)
  );

  const handleNavigate = useCallback(
    (path: ToOptions['to']) => {
      setIsOpen(false);
      setQuery('');
      navigate({ to: path });
    },
    [navigate]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = (title: string, description: string) =>
    !normalizedQuery ||
    `${title} ${description}`.toLowerCase().includes(normalizedQuery);
  const filteredPinnedNavItems = pinnedNavItems.filter((item) =>
    matchesQuery(item.title, item.description)
  );
  const filteredToolNavItems = toolNavItems.filter((item) =>
    matchesQuery(item.title, item.description)
  );
  const showHome = matchesQuery(
    'Home',
    'Open toolbox catalog and tool overview'
  );

  return (
    <>
      <button
        aria-label="Open command menu"
        className="cursor-pointer"
        onClick={() => {
          setQuery('');
          setIsOpen(true);
        }}
        type="button"
      >
        {children}
      </button>

      <CommandMenu
        aria-label="Command Menu"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onQueryChange={setQuery}
        shortcut="k"
      >
        <CommandMenuSearch placeholder="Type a command or search..." />
        <CommandMenuList>
          {filteredPinnedNavItems.length > 0 && (
            <CommandMenuSection label="Pinned">
              {filteredPinnedNavItems.map((item) => (
                <CommandMenuItem
                  key={item.slug}
                  onClick={() => handleNavigate(item.path)}
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
          {(showHome || filteredToolNavItems.length > 0) && (
            <CommandMenuSection label="Navigation">
              {showHome && (
                <CommandMenuItem
                  onClick={() => handleNavigate('/')}
                  textValue="Home"
                >
                  <IconGlobe />
                  <CommandMenuLabel>Home</CommandMenuLabel>
                  <CommandMenuDescription className="col-start-2 row-start-2 ms-0">
                    Open toolbox catalog and tool overview
                  </CommandMenuDescription>
                </CommandMenuItem>
              )}
              {filteredToolNavItems.map((item) => (
                <CommandMenuItem
                  key={item.slug}
                  onClick={() => handleNavigate(item.path)}
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
          )}
          {!showHome &&
            filteredPinnedNavItems.length === 0 &&
            filteredToolNavItems.length === 0 && (
              <div className="col-span-full p-4 text-center text-muted-fg text-sm">
                No results found.
              </div>
            )}
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
