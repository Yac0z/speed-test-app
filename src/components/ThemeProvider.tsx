'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme() {
  if (typeof window === 'undefined') {return 'dark';}
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {return getSystemTheme();}
  return theme;
}

export function ThemeProvider(props: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('speed-test-theme');
    const initial =
      stored === 'light' || stored === 'dark' || stored === 'system'
        ? stored
        : 'dark';
    setThemeState(initial);
    setResolvedTheme(resolveTheme(initial));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {return;}

    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) {return;}

    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      if (theme === 'system') {
        setResolvedTheme(getSystemTheme());
      }
    };
    media.addEventListener('change', handler);
    return () =>{  media.removeEventListener('change', handler); };
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('speed-test-theme', newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme: mounted ? resolvedTheme : 'dark',
      }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
