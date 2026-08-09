import { IconGlobe, IconHamburger } from '@intentui/icons';
import { useRouterState } from '@tanstack/react-router';
import { Link } from 'react-aria-components';

import { getMobileNavItems } from '@/lib/navigation/tool-registry';

import { SidebarTrigger } from './ui/sidebar';

const homeItem = { href: '/' as const, icon: <IconGlobe />, label: 'Home' };

const MAX_MOBILE_TOOLS = 4;

export const MobileBottomNav = () => {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  const toolItems = getMobileNavItems()
    .slice(0, MAX_MOBILE_TOOLS)
    .map((item) => ({
      href: item.path,
      icon: item.icon,
      label: item.title,
    }));

  const navItems = [homeItem, ...toolItems];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-t bg-navbar/80 px-1 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur-xs md:hidden"
    >
      {navItems.map(({ href, icon, label }) => {
        const isActive = currentPath === href;
        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 px-1 py-1 font-medium text-xs transition-colors ${isActive ? 'text-primary' : 'text-muted-fg hover:text-fg'}`}
            href={href}
            key={href}
          >
            <span className="size-5">{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
      <SidebarTrigger
        aria-label="More navigation"
        className="sm:size-11 sm:*:[svg]:size-5"
        size="sq-md"
      >
        <div className="flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 px-1 py-1 font-medium text-muted-fg text-xs">
          <IconHamburger className="size-5" />
          <span>More</span>
        </div>
      </SidebarTrigger>
    </nav>
  );
};
