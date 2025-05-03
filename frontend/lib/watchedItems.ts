import { MediaItem } from '@/types/tmdb';
import { safeLocalStorage } from './clientUtils';
import { isWatchLater, removeWatchLater } from './watchLaterItems';

interface WatchedItem extends MediaItem {
  media_type: string;
  added_at: number;
}

export const getWatchedItems = (): WatchedItem[] => {
  return safeLocalStorage.getJSON<WatchedItem[]>('cinetech_watched_items', []);
};

export const isWatched = (id: number, mediaType: string): boolean => {
  try {
    const watchedItems = getWatchedItems();
    return watchedItems.some(item => item.id === id && item.media_type === mediaType);
  } catch (error) {
    console.error('Error checking if item is watched:', error);
    return false;
  }
};

export const removeWatched = (id: number, mediaType: string): void => {
  try {
    const watchedItems = getWatchedItems();
    const updatedItems = watchedItems.filter(
      item => !(item.id === id && item.media_type === mediaType)
    );
    safeLocalStorage.setJSON('cinetech_watched_items', updatedItems);
    
    // Dispatch a custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watched-updated'));
    }
  } catch (error) {
    console.error('Error removing from watched items:', error);
  }
};

export const toggleWatched = (media: any, mediaType: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchedItems = getWatchedItems();
    const isAlreadyWatched = isWatched(media.id, mediaType);
    
    if (isAlreadyWatched) {
      // Remove from watched
      const updatedItems = watchedItems.filter(
        item => !(item.id === media.id && item.media_type === mediaType)
      );
      safeLocalStorage.setJSON('cinetech_watched_items', updatedItems);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('watched-updated'));
      return false;
    } else {
      // Add to watched
      const itemToAdd = {
        ...media,
        media_type: mediaType,
        added_at: Date.now()
      };
      
      const updatedItems = [...watchedItems, itemToAdd];
      safeLocalStorage.setJSON('cinetech_watched_items', updatedItems);
      
      // Remove from watch later if it exists there
      if (isWatchLater(media.id, mediaType)) {
        removeWatchLater(media.id, mediaType);
      }
      
      // Dispatch events to notify other components
      window.dispatchEvent(new CustomEvent('watched-updated'));
      window.dispatchEvent(new CustomEvent('watch-later-updated'));
      
      return true;
    }
  } catch (error) {
    console.error('Error toggling watched status:', error);
    return isWatched(media.id, mediaType);
  }
};
