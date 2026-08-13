'use client';

import { IconGlobe, IconSearch, IconStar } from '@intentui/icons';
import type { ToOptions } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import {
  CommandMenu,
  CommandMenuFooter,
  CommandMenuSearch,
} from '@/lib/components/ui/command-menu';
import { dropdownItemStyles } from '@/lib/components/ui/dropdown';
import { Input, InputGroup } from '@/lib/components/ui/input';
import { Text } from '@/lib/components/ui/text';
import { useIsMobile } from '@/lib/hooks/use-mobile';
import { usePinnedTools } from '@/lib/hooks/use-pinned-tools';
import { getToolNavItems } from '@/lib/navigation/tool-registry';

const toolNavItems = getToolNavItems();

const CommandResultList = ({ children }: { children: React.ReactNode }) => (
  <div
    aria-label="Command results"
    className="grid max-h-full flex-1 content-start overflow-y-auto border-t p-2 sm:max-h-110"
    role="menu"
  >
    {children}
  </div>
);

const CommandResultSection = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <section
    aria-label={label}
    className="grid grid-cols-[auto_1fr] content-start gap-y-0.25 [&+&]:mt-6"
  >
    <div className="col-span-full mb-1 block min-w-(--trigger-width) truncate px-2.5 text-muted-fg text-xs">
      {label}
    </div>
    {children}
  </section>
);

const CommandResultItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    className={dropdownItemStyles({
      className:
        'text-start hover:bg-accent hover:text-accent-fg focus-visible:bg-accent focus-visible:text-accent-fg focus-visible:outline-none',
    })}
    onClick={onClick}
    role="menuitem"
    type="button"
  >
    {children}
  </button>
);

const CommandResultLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="col-start-2 [&:has(+svg)]:pe-6" slot="label">
    {children}
  </span>
);

const CommandResultDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <span
    className="col-start-2 row-start-2 font-normal text-muted-fg text-sm"
    slot="description"
  >
    {children}
  </span>
);

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
        shortcut="k"
      >
        <CommandMenuSearch
          onChange={setQuery}
          placeholder="Type a command or search..."
        />
        <CommandResultList>
          {filteredPinnedNavItems.length > 0 && (
            <CommandResultSection label="Pinned">
              {filteredPinnedNavItems.map((item) => (
                <CommandResultItem
                  key={item.slug}
                  onClick={() => handleNavigate(item.path)}
                >
                  <IconStar />
                  <CommandResultLabel>{item.title}</CommandResultLabel>
                  <CommandResultDescription>
                    {item.description}
                  </CommandResultDescription>
                </CommandResultItem>
              ))}
            </CommandResultSection>
          )}
          {(showHome || filteredToolNavItems.length > 0) && (
            <CommandResultSection label="Navigation">
              {showHome && (
                <CommandResultItem onClick={() => handleNavigate('/')}>
                  <IconGlobe />
                  <CommandResultLabel>Home</CommandResultLabel>
                  <CommandResultDescription>
                    Open toolbox catalog and tool overview
                  </CommandResultDescription>
                </CommandResultItem>
              )}
              {filteredToolNavItems.map((item) => (
                <CommandResultItem
                  key={item.slug}
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.icon}
                  <CommandResultLabel>{item.title}</CommandResultLabel>
                  <CommandResultDescription>
                    {item.description}
                  </CommandResultDescription>
                </CommandResultItem>
              ))}
            </CommandResultSection>
          )}
          {!showHome &&
            filteredPinnedNavItems.length === 0 &&
            filteredToolNavItems.length === 0 && (
              <div className="col-span-full p-4 text-center text-muted-fg text-sm">
                No results found.
              </div>
            )}
        </CommandResultList>
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
