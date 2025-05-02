import { MediaItem } from '@/types/tmdb';

interface WatchedItem extends MediaItem {
  media_type: string;
  added_at: number;
}

export const getWatchedItems = (): WatchedItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const watchedItems = localStorage.getItem('watched');
    if (!watchedItems) return [];
    
    return JSON.parse(watchedItems);
  } catch (error) {
    console.error('Error getting watched items:', error);
    return [];
  }
};

export const isWatched = (id: number, mediaType: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchedItems = getWatchedItems();
    return watchedItems.some(item => item.id === id && item.media_type === mediaType);
  } catch (error) {
    console.error('Error checking if item is watched:', error);
    return false;
  }
};

export const removeWatched = (id: number, mediaType: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const watchedItems = getWatchedItems();
    const updatedItems = watchedItems.filter(
      item => !(item.id === id && item.media_type === mediaType)
    );
    localStorage.setItem('watched', JSON.stringify(updatedItems));
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('watched-updated'));
  } catch (error) {
    console.error('Error removing from watched items:', error);
  }
};

export const toggleWatched = (item: MediaItem, mediaType: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchedItems = getWatchedItems();
    const alreadyWatched = isWatched(item.id, mediaType);
    
    if (alreadyWatched) {
      // Remove from watched
      const updatedItems = watchedItems.filter(
        watchedItem => !(watchedItem.id === item.id && watchedItem.media_type === mediaType)
      );
      localStorage.setItem('watched', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('watched-updated'));
      return false;
    } else {
      // Add to watched
      const watchedItem = {
        ...item,
        media_type: mediaType,
        added_at: Date.now()
      };
      localStorage.setItem('watched', JSON.stringify([...watchedItems, watchedItem]));
      window.dispatchEvent(new CustomEvent('watched-updated'));
      return true;
    }
  } catch (error) {
    console.error('Error toggling watched status:', error);
    return false;
  }
};
