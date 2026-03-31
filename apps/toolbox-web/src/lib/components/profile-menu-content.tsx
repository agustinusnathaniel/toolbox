import {
  IconCamera,
  IconCodeLines,
  IconDashboard,
  IconMessage,
  IconMoon,
  IconSun,
} from '@intentui/icons';
import type { ToOptions } from '@tanstack/react-router';

import { Button } from '@/lib/components/ui/button';
import { MenuHeader, MenuItem, MenuSection } from '@/lib/components/ui/menu';

import { useTheme } from './theme-provider';

export const ProfileMenuContent = () => {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <MenuSection>
        <MenuHeader className="flex justify-between" separator>
          <div>
            <span className="block">Kurt Cobain</span>
            <span className="font-normal text-muted-fg">@cobain</span>
          </div>
          <Button
            intent="plain"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <IconMoon /> : <IconSun />}
          </Button>
        </MenuHeader>
      </MenuSection>

      <MenuItem href="/">
        <IconDashboard />
        Home
      </MenuItem>
      <MenuItem href={'/tools/wa-link-helper' as ToOptions['to']}>
        <IconMessage />
        WA Link Helper
      </MenuItem>
      <MenuItem href={'/tools/zippy-img' as ToOptions['to']}>
        <IconCamera />
        Zippy Image
      </MenuItem>
      <MenuItem href={'/tools/js-perf-comparator' as ToOptions['to']}>
        <IconCodeLines />
        JS Perf Comparator
      </MenuItem>
    </>
  );
};
