import { IconMoon, IconSun } from '@intentui/icons';
import { useTheme } from 'next-themes';

import { Button, type ButtonProps } from '@/lib/components/ui/button';

interface ThemeToggleProps {
  className?: string;
  size?: ButtonProps['size'];
}

export const ThemeToggle = ({ className, size }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      aria-label="Toggle theme"
      className={className}
      intent="plain"
      onPress={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      size={size}
    >
      {/* Both icons are rendered and toggled via CSS so the markup is
          identical on server and client (theme is unknown at SSR time). */}
      <IconMoon aria-hidden="true" className="dark:hidden" />
      <IconSun aria-hidden="true" className="hidden dark:block" />
    </Button>
  );
};
