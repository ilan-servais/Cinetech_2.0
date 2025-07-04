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
