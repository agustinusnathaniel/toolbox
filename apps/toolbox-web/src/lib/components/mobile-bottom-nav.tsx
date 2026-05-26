import {
  IconBrandWhatsapp,
  IconCamera,
  IconGlobe,
  IconHamburger,
  IconQrCode,
} from '@intentui/icons';
import { useRouterState } from '@tanstack/react-router';
import { Link } from 'react-aria-components';

import { SidebarTrigger } from './ui/sidebar';

const navItems = [
  { href: '/' as const, icon: IconGlobe, label: 'Home' },
  {
    href: '/wa-link-helper' as const,
    icon: IconBrandWhatsapp,
    label: 'WA Link',
  },
  {
    label: 'Zippy Image',
    href: '/zippy-img' as const,
    icon: IconCamera,
  },
  { href: '/qrcode-generator' as const, icon: IconQrCode, label: 'QR Code' },
];

export const MobileBottomNav = () => {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-t bg-navbar/80 py-2.5 backdrop-blur-xs md:hidden"
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = currentPath === href;
        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 px-3 py-1 font-medium text-xs transition-colors ${isActive ? 'text-primary' : 'text-muted-fg hover:text-fg'}`}
            href={href}
            key={href}
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </Link>
        );
      })}
      <SidebarTrigger>
        <div className="flex flex-col items-center gap-1 px-3 py-1 font-medium text-muted-fg text-xs">
          <IconHamburger className="size-5" />
          <span>More</span>
        </div>
      </SidebarTrigger>
    </nav>
  );
};
