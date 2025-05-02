import { MediaItem } from '@/types/tmdb';
import { safeLocalStorage } from './clientUtils';

interface WatchedItem extends MediaItem {
  media_type: string;
  added_at: number;
}

export const getWatchedItems = (): WatchedItem[] => {
  return safeLocalStorage.getJSON<WatchedItem[]>('watched', []);
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
    safeLocalStorage.setJSON('watched', updatedItems);
    
    // Dispatch a custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watched-updated'));
    }
  } catch (error) {
    console.error('Error removing from watched items:', error);
  }
};

export const toggleWatched = (item: MediaItem, mediaType: string): boolean => {
  try {
    const watchedItems = getWatchedItems();
    const alreadyWatched = isWatched(item.id, mediaType);
    
    if (alreadyWatched) {
      // Remove from watched
      const updatedItems = watchedItems.filter(
        watchedItem => !(watchedItem.id === item.id && watchedItem.media_type === mediaType)
      );
      safeLocalStorage.setJSON('watched', updatedItems);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('watched-updated'));
      }
      return false;
    } else {
      // Add to watched
      const watchedItem = {
        ...item,
        media_type: mediaType,
        added_at: Date.now()
      };
      safeLocalStorage.setJSON('watched', [...watchedItems, watchedItem]);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('watched-updated'));
      }
      return true;
    }
  } catch (error) {
    console.error('Error toggling watched status:', error);
    return false;
  }
};
