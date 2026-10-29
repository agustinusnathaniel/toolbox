'use client';

import { RiGlobalLine, RiSearchLine, RiStarLine } from '@remixicon/react';
import type { ToOptions } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/lib/components/ui/command';
import { Kbd } from '@/lib/components/ui/kbd';
import { useIsMobile } from '@/lib/hooks/use-mobile';
import { usePinnedTools } from '@/lib/hooks/use-pinned-tools';
import {
  getWorstCaseNavItems,
  useWorstCaseMode,
} from '@/lib/hooks/use-worst-case-mode';
import { getToolNavItems } from '@/lib/navigation/tool-registry';

interface GlobalCommandMenuProps {
  children: React.ReactNode;
}

const GlobalCommandMenu = ({ children }: GlobalCommandMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { pinnedSlugs } = usePinnedTools();
  const worstCase = useWorstCaseMode();
  const toolNavItems = getWorstCaseNavItems(getToolNavItems(), worstCase);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

      <CommandDialog
        aria-label="Command Menu"
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <Command label="Command Menu">
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {pinnedNavItems.length > 0 && (
              <CommandGroup heading="Pinned">
                {pinnedNavItems.map((item) => (
                  <CommandItem
                    className="grid grid-cols-[auto_1fr] items-start"
                    key={item.slug}
                    onSelect={() => handleNavigate(item.path)}
                    value={item.title}
                  >
                    <RiStarLine aria-hidden="true" className="mt-0.5" />
                    <span className="font-medium">{item.title}</span>
                    <span className="col-start-2 row-start-2 text-muted-foreground text-xs">
                      {item.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Navigation">
              <CommandItem
                className="grid grid-cols-[auto_1fr] items-start"
                onSelect={() => handleNavigate('/')}
                value="Home"
              >
                <RiGlobalLine aria-hidden="true" className="mt-0.5" />
                <span className="font-medium">Home</span>
                <span className="col-start-2 row-start-2 text-muted-foreground text-xs">
                  Open toolbox catalog and tool overview
                </span>
              </CommandItem>
              {toolNavItems.map((item) => (
                <CommandItem
                  className="grid grid-cols-[auto_1fr] items-start"
                  key={item.slug}
                  onSelect={() => handleNavigate(item.path)}
                  value={item.title}
                >
                  <span className="mt-0.5 [&_svg]:size-4.5">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                  <span className="col-start-2 row-start-2 text-muted-foreground text-xs">
                    {item.description}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {isMobile ? null : (
            <div className="border-t px-3 py-2 text-muted-foreground text-xs">
              ↑↓ to navigate | ↵ to select | esc to close
            </div>
          )}
        </Command>
      </CommandDialog>
    </>
  );
};

export const CommandMenuTrigger = () => (
  <GlobalCommandMenu>
    <span className="flex size-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:ring-3 group-focus-visible:ring-ring/20 sm:h-8 sm:w-40 sm:justify-start sm:gap-2 sm:border sm:border-input sm:px-3">
      <RiSearchLine aria-hidden="true" className="size-4.5 shrink-0" />
      <span className="hidden min-w-0 flex-1 truncate text-start text-sm sm:block">
        Search...
      </span>
      <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
    </span>
  </GlobalCommandMenu>
);
