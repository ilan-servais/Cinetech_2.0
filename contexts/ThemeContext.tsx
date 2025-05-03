'use client';

import { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useTheme as useNextTheme } from 'next-themes';

export const ThemeContext = createContext<{
  theme: string | undefined;
  setTheme: (theme: string) => void;
}>({
  theme: undefined,
  setTheme: () => {},
});

export function ThemeProvider({ 
  children, 
  ...props 
}: { 
  children: ReactNode; 
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export const useTheme = () => useNextTheme();
