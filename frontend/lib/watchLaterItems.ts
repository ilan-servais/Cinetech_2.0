import { MediaItem } from '@/types/tmdb';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface WatchLaterItem extends MediaItem {
  media_type: string;
  added_at: number;
}

// Fonction pour obtenir l'utilisateur actuel depuis le localStorage
const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    
    const user = JSON.parse(userString);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if an item is in the watch later list
 */
export const isWatchLater = async (id: number, mediaType: string): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user?.id) return false;
  
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
  const user = getCurrentUser();
  if (!user?.id) return [];
  
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
    console.log('Watch Later items récupérés depuis l\'API:', data.items?.length || 0);
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
