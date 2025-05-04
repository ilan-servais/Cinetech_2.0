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
  attribute = 'class',
  defaultTheme,
  enableSystem 
}: { 
  children: ReactNode; 
  attribute?: 'class' | 'data-theme' | 'data-mode';
  defaultTheme?: string;
  enableSystem?: boolean;
}) {
  // Convertir attribute en type acceptable pour NextThemesProvider
  const props = {
    attribute: attribute as 'class',
    defaultTheme,
    enableSystem
  };
  
  return <NextThemesProvider {...props}>
    {children}
  </NextThemesProvider>;
}

export const useTheme = () => useNextTheme();
