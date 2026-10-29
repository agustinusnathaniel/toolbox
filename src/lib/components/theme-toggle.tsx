import { RiMoonLine, RiSunLine } from '@remixicon/react';
import { useTheme } from 'next-themes';

import { Button } from '@/lib/components/ui/button';

interface ThemeToggleProps {
  className?: string;
  size?: React.ComponentProps<typeof Button>['size'];
}

export const ThemeToggle = ({ className, size = 'icon' }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      aria-label="Toggle theme"
      className={className}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      size={size}
      variant="ghost"
    >
      {/* Both icons are rendered and toggled via CSS so the markup is
          identical on server and client (theme is unknown at SSR time). */}
      <span
        aria-hidden="true"
        className="relative grid size-4 place-items-center"
      >
        <RiMoonLine
          aria-hidden="true"
          className="col-start-1 row-start-1 size-4 scale-100 opacity-100 blur-none transition-[transform,opacity,filter] duration-200 [transition-timing-function:cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none dark:scale-25 dark:opacity-0 dark:blur-[4px]"
        />
        <RiSunLine
          aria-hidden="true"
          className="col-start-1 row-start-1 size-4 scale-25 opacity-0 blur-[4px] transition-[transform,opacity,filter] duration-200 [transition-timing-function:cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none dark:scale-100 dark:opacity-100 dark:blur-none"
        />
      </span>
    </Button>
  );
};
