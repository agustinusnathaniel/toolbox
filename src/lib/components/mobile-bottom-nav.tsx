import { IconGlobe, IconHamburger } from '@intentui/icons';
import { useRouterState } from '@tanstack/react-router';
import { Link } from 'react-aria-components';

import { getMobileNavItems } from '@/lib/navigation/tool-registry';

import { SidebarTrigger } from './ui/sidebar';

const homeItem = { href: '/' as const, icon: <IconGlobe />, label: 'Home' };

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
            className={`${itemClass} ${
              isActive ? 'text-primary' : 'text-muted-fg hover:text-fg'
            }`}
            href={href}
            key={href}
          >
            <span className={iconClass}>{icon}</span>
            <span className="max-w-full truncate">{label}</span>
          </Link>
        );
      })}
      {/* The sq-md variant's size-11 would cap this button at 44px and the
          Button base's border would stretch it to 50px, so both are neutralised
          in favour of the same 48px row height as the link items. */}
      <SidebarTrigger
        aria-label="More navigation"
        className={`${itemClass} h-auto self-stretch border-0 text-muted-fg`}
        intent="plain"
        size="sq-md"
      >
        <IconHamburger className={iconClass} />
        <span className="max-w-full truncate">More</span>
      </SidebarTrigger>
    </nav>
  );
};
