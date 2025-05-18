import { MediaItem } from '@/types/tmdb';
import { 
  getCurrentUser,
  getMediaStatus, 
  toggleUserStatus, 
  removeUserStatus,
  getStatusItems
} from './userStatusService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface WatchedItem extends MediaItem {
  media_type: string;
  added_at: number;
}

/**
 * Check if an item is in the watched list
 */
export const isWatched = async (id: number, mediaType: string): Promise<boolean> => {
  try {
    const status = await getMediaStatus(id, mediaType);
    return status.watched;
  } catch (error) {
    console.error('Error checking watched status:', error);
    return false;
  }
};

/**
 * Get all items from the watched list
 */
export const getWatchedItems = async (): Promise<WatchedItem[]> => {
  try {
    const items = await getStatusItems('WATCHED');
    console.log('Watched items récupérés depuis l\'API:', items.length);
    
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
    console.error('Error getting watched items:', error);
    return [];
  }
};

/**
 * Toggle an item in the watched list
 */
export const toggleWatched = async (media: any, mediaType: string): Promise<boolean> => {
  try {
    return await toggleUserStatus(
      media.id, 
      mediaType, 
      'WATCHED',
      media.title || media.name,
      media.poster_path
    );
  } catch (error) {
    console.error('Error toggling watched status:', error);
    return false;
  }
};

/**
 * Remove an item from the watched list
 */
export const removeWatched = async (id: number, mediaType: string): Promise<void> => {
  try {
    await removeUserStatus(id, mediaType, 'WATCHED');
    console.log('Item retiré de la liste "déjà vu" via API');
  } catch (error) {
    console.error('Error removing from watched:', error);
  }
};

export const toggleWatched = async (media: any, mediaType: string): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user?.id) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/user/watched/toggle`, {
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
      throw new Error('Failed to toggle watched status');
    }
    
    const data = await response.json();
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('watched-updated'));
    
    // If the item was added to watched and it was in watch later list, it would be removed from watch later
    if (data.watched) {
      window.dispatchEvent(new CustomEvent('watch-later-updated'));
    }
    
    console.log(`Média ${data.watched ? 'marqué comme vu' : 'non vu'} via API`);
    return data.watched;
  } catch (error) {
    console.error('Error toggling watched status:', error);
    return false;
  }
};

/**
 * Remove an item from the watched list
 */
export const removeWatched = async (id: number, mediaType: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user?.id) return;

  try {
    const response = await fetch(`${API_BASE_URL}/user/watched/${mediaType}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove from watched');
    }
    
    console.log('Item retiré de la liste "déjà vu" via API');
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('watched-updated'));
  } catch (error) {
    console.error('Error removing from watched:', error);
  }
};
