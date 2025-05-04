/**
 * Safely check if code is running in browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
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
 * Safely access localStorage with proper type handling
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    if (!isBrowser()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    if (!isBrowser()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing ${key} from localStorage:`, e);
      return false;
    }
  },
  
  /**
   * Safely parse JSON from localStorage
   */
  getJSON: <T>(key: string, defaultValue: T): T => {
    if (!isBrowser()) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Error parsing JSON from ${key}:`, e);
      return defaultValue;
    }
  },
  
  /**
   * Safely store JSON in localStorage
   */
  setJSON: <T>(key: string, value: T): boolean => {
    if (!isBrowser()) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error stringifying and storing JSON to ${key}:`, e);
      return false;
    }
  }
};
