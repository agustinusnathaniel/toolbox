import { RiGlobalLine, RiMenuLine } from '@remixicon/react';
import { Link, useRouterState } from '@tanstack/react-router';

import { usePrefetchRoute } from '@/lib/hooks/use-prefetch-route';
import { getMobileNavItems } from '@/lib/navigation/tool-registry';

import { SidebarTrigger } from './ui/sidebar';

const homeItem = {
  href: '/' as const,
  icon: <RiGlobalLine aria-hidden="true" />,
  label: 'Home',
};

const MAX_MOBILE_TOOLS = 4;

// Every nav item renders its icon inside this one box, so a tool that imports
// its icon from a different library (lucide ships a 24x24 svg with no sizing
// class) cannot render larger than its neighbours. The inner svg is forced to
// fill the box instead of contributing its own intrinsic size.
const iconClass =
  'flex size-5 shrink-0 items-center justify-center [&_svg]:size-full';

const itemClass =
  'flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 px-1 py-1 font-medium text-xs transition-colors';

export const MobileBottomNav = () => {
  const { location } = useRouterState();
  const currentPath = location.pathname;
  const prefetchRoute = usePrefetchRoute();

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
      className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-border/50 border-t bg-background/95 px-1 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur-xs md:hidden"
    >
      {navItems.map(({ href, icon, label }) => {
        const isActive = currentPath === href;
        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            className={`${itemClass} ${
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            key={href}
            onFocus={() => prefetchRoute(href)}
            onMouseEnter={() => prefetchRoute(href)}
            to={href}
          >
            <span className={iconClass}>{icon}</span>
            <span className="max-w-full truncate" title={label}>
              {label}
            </span>
          </Link>
        );
      })}
      <SidebarTrigger
        aria-label="More navigation"
        className={`${itemClass} h-auto self-stretch border-0 text-muted-foreground`}
      >
        <RiMenuLine aria-hidden="true" className={iconClass} />
        <span className="max-w-full truncate">More</span>
      </SidebarTrigger>
    </nav>
  );
};
