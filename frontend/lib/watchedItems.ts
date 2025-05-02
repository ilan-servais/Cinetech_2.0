interface WatchedItem {
  id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  added_at: number; // timestamp
}

/**
 * Check if a media item is marked as watched
 */
export const isWatched = (id: number, mediaType: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchedItems = getWatchedItems();
    return watchedItems.some(item => 
      item.id === id && item.media_type === mediaType
    );
  } catch (error) {
    console.error('Error checking watched status:', error);
    return false;
  }
};

/**
 * Get all watched items from localStorage
 */
export const getWatchedItems = (): WatchedItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const items = localStorage.getItem('viewedItems');
    if (!items) return [];
    
    return JSON.parse(items);
  } catch (error) {
    console.error('Error getting watched items:', error);
    return [];
  }
};

/**
 * Toggle watched status for a media item
 */
export const toggleWatched = (item: {
  id: number;
  media_type: string;
  title?: string;
  name?: string; 
  poster_path: string | null;
}): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchedItems = getWatchedItems();
    const existingIndex = watchedItems.findIndex(
      i => i.id === item.id && i.media_type === item.media_type
    );
    
    if (existingIndex >= 0) {
      // Remove from watched
      watchedItems.splice(existingIndex, 1);
    } else {
      // Add to watched
      watchedItems.push({
        id: item.id,
        media_type: item.media_type,
        title: item.title || item.name || 'Sans titre',
        poster_path: item.poster_path,
        added_at: Date.now()
      });
    }
    
    // Save to localStorage
    localStorage.setItem('viewedItems', JSON.stringify(watchedItems));
    
    // Notify components about the change
    window.dispatchEvent(new CustomEvent('watched-updated'));
    
    return true;
  } catch (error) {
    console.error('Error toggling watched status:', error);
    return false;
  }
};

/**
 * Get the count of watched items
 */
export const getWatchedCount = (): number => {
  return getWatchedItems().length;
};
