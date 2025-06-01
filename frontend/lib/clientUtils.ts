/**
 * Safely check if code is running in browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Safe localStorage wrapper to handle SSR and exceptions
 */
export const safeLocalStorage = {
  getItem: (key: string, defaultValue: string = ''): string => {
    if (!isBrowser()) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },
  
  removeItem: (key: string): void => {
    if (!isBrowser()) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },
  
  getJSON: <T>(key: string, defaultValue: T): T => {
    if (!isBrowser()) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading JSON from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  setJSON: <T>(key: string, value: T): void => {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting JSON in localStorage key "${key}":`, error);
    }
  }
};

/**
 * Hook to safely check if component has mounted
 * Usage:
 * const mounted = useHasMounted();
 * if (!mounted) return null; // or a placeholder
 */
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const useHasMounted = (): boolean => {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
};

/**
 * Hook to check if current page is the favorites page
 */
export const useIsFavorisPage = (): boolean => {
  const pathname = usePathname();
  return pathname === '/favorites';
};

/**
 * Clear all user-related data from localStorage on logout
 */
export const clearUserData = (): void => {
  try {
    window.dispatchEvent(new CustomEvent('favorites-updated'));
    window.dispatchEvent(new CustomEvent('watched-updated'));
    window.dispatchEvent(new CustomEvent('watch-later-updated'));
    console.log('User data cleared');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};
