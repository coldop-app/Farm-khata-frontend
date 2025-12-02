import { memo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

const ThemeToggleComponent = () => {
  const { setTheme, theme, resolvedTheme } = useTheme();

  // Use resolvedTheme which is available after hydration
  const currentTheme = resolvedTheme || theme;

  const handleToggle = useCallback(() => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }, [setTheme, currentTheme]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className="h-9 w-9 relative"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export const ThemeToggle = memo(ThemeToggleComponent);
