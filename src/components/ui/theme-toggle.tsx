'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const effective = theme === 'system' ? systemTheme : theme;

  const toggle = () => {
    const next = effective === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <Button onClick={toggle} variant="outline" size="sm" aria-label="Toggle theme">
      {effective === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
