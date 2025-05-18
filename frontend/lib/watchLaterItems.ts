import { MediaItem } from '@/types/tmdb';
import {
  getMediaStatus,
  toggleUserStatus,
  removeUserStatus,
  getStatusItems
} from './userStatusService';

interface WatchLaterItem extends MediaItem {
  media_type: string;
  added_at: number;
}

/**
 * Check if an item is in the watch later list
 */
export const isWatchLater = async (id: number, mediaType: string): Promise<boolean> => {
  try {
    const status = await getMediaStatus(id, mediaType);
    return status.watchLater;
  } catch (error) {
    console.error('Error checking watch later status:', error);
    return false;
  }
};

/**
 * Get all items from the watch later list
 */
export const getWatchLaterItems = async (): Promise<WatchLaterItem[]> => {
  try {
    const items = await getStatusItems('WATCH_LATER');
    console.log('Watch Later items récupérés depuis l\'API:', items.length);
    
    // Transform to expected format
    return items.map(item => ({
      id: item.mediaId,
      media_type: item.mediaType,
      title: item.title || '',
      name: item.title || '',
      poster_path: item.poster_path || null,
      added_at: new Date(item.createdAt).getTime()
    }));
  } catch (error) {
    console.error('Error getting watch later items:', error);
    return [];
  }
};

/**
 * Toggle an item in the watch later list
 */
export const toggleWatchLater = async (media: any, mediaType: string): Promise<boolean> => {
  try {
    return await toggleUserStatus(
      media.id, 
      mediaType, 
      'WATCH_LATER',
      media.title || media.name,
      media.poster_path
    );
  } catch (error) {
    console.error('Error toggling watch later status:', error);
    return false;
  }
};

/**
 * Remove an item from the watch later list
 */
export const removeWatchLater = async (id: number, mediaType: string): Promise<void> => {
  try {
    await removeUserStatus(id, mediaType, 'WATCH_LATER');
    console.log('Item retiré de la liste "à voir plus tard" via API');
  } catch (error) {
    console.error('Error removing from watch later:', error);
  }
};


export const toggleWatchLater = async (media: any, mediaType: string): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user?.id) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/user/watchlater/toggle`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId: media.id,
        mediaType,
        title: media.title || media.name,
        posterPath: media.poster_path
      })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle watch later status');
    }
    
    const data = await response.json();
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('watch-later-updated'));
    
    // If the item was added to watch later and it was in watched list, it would be removed from watched
    if (data.watchLater) {
      window.dispatchEvent(new CustomEvent('watched-updated'));
    }
    
    console.log(`Média ${data.watchLater ? 'ajouté à "à voir plus tard"' : 'retiré de "à voir plus tard"'} via API`);
    return data.watchLater;
  } catch (error) {
    console.error('Error toggling watch later status:', error);
    return false;
  }
};

/**
 * Remove an item from the watch later list
 */
export const removeWatchLater = async (id: number, mediaType: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user?.id) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/user/watchlater/${mediaType}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove from watch later');
    }
    
    console.log('Item retiré de la liste "à voir plus tard" via API');
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('watch-later-updated'));
  } catch (error) {
    console.error('Error removing from watch later:', error);
  }
};
