import { MediaItem } from '@/types/tmdb';
import { safeLocalStorage } from './clientUtils';
import { removeWatched, isWatched } from './watchedItems';

interface WatchLaterItem extends MediaItem {
  media_type: string;
  added_at: number;
}

/**
 * Check if an item is in the watch later list
 */
export const isWatchLater = (id: number, mediaType: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchLaterItems = safeLocalStorage.getJSON<WatchLaterItem[]>('cinetech_watch_later', []);
    return watchLaterItems.some((item) => item.id === id && item.media_type === mediaType);
  } catch (error) {
    console.error('Error checking watch later status:', error);
    return false;
  }
};

/**
 * Get all items from the watch later list
 */
export const getWatchLaterItems = (): WatchLaterItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    return safeLocalStorage.getJSON<WatchLaterItem[]>('cinetech_watch_later', []);
  } catch (error) {
    console.error('Error getting watch later items:', error);
    return [];
  }
};

/**
 * Toggle an item in the watch later list
 */
export const toggleWatchLater = (media: any, mediaType: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const currentItems = getWatchLaterItems();
    const isAlreadyAdded = isWatchLater(media.id, mediaType);
    
    // First check if it's in watched list and remove it if needed
    const wasWatched = isWatched(media.id, mediaType);
    if (wasWatched) {
      removeWatched(media.id, mediaType);
      // Dispatch event to notify components that watched list changed
      window.dispatchEvent(new CustomEvent('watched-updated'));
    }
    
    if (isAlreadyAdded) {
      // Remove from watch later
      const updatedItems = currentItems.filter(
        (item) => !(item.id === media.id && item.media_type === mediaType)
      );
      safeLocalStorage.setJSON('cinetech_watch_later', updatedItems);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('watch-later-updated'));
      return false;
    } else {
      // Add to watch later
      const itemToAdd = {
        ...media,
        media_type: mediaType,
        added_at: Date.now()
      };
      
      const updatedItems = [...currentItems, itemToAdd];
      safeLocalStorage.setJSON('cinetech_watch_later', updatedItems);
      
      // Dispatch events to notify other components
      window.dispatchEvent(new CustomEvent('watch-later-updated'));
      
      return true;
    }
  } catch (error) {
    console.error('Error toggling watch later status:', error);
    return isWatchLater(media.id, mediaType);
  }
};

/**
 * Remove an item from the watch later list
 */
export const removeWatchLater = (id: number, mediaType: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const currentItems = getWatchLaterItems();
    const updatedItems = currentItems.filter(
      (item) => !(item.id === id && item.media_type === mediaType)
    );
    
    safeLocalStorage.setJSON('cinetech_watch_later', updatedItems);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('watch-later-updated'));
  } catch (error) {
    console.error('Error removing from watch later:', error);
  }
};
