import { MediaItem } from '@/types/tmdb';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface WatchLaterItem extends MediaItem {
  media_type: string;
  added_at: number;
}

/**
 * Check if an item is in the watch later list
 */
export const isWatchLater = async (id: number, mediaType: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/user/status/${mediaType}/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) return false;
    
    const data = await response.json();
    return data.watchLater || false;
  } catch (error) {
    console.error('Error checking watch later status:', error);
    return false;
  }
};

/**
 * Get all items from the watch later list
 */
export const getWatchLaterItems = async (): Promise<WatchLaterItem[]> => {
  if (typeof window === 'undefined') return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/user/watchlater`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) return [];
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error getting watch later items:', error);
    return [];
  }
};

/**
 * Toggle an item in the watch later list
 */
export const toggleWatchLater = async (media: any, mediaType: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
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
  if (typeof window === 'undefined') return;
  
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
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('watch-later-updated'));
  } catch (error) {
    console.error('Error removing from watch later:', error);
  }
};
