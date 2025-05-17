import { MediaItem } from '@/types/tmdb';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface WatchedItem extends MediaItem {
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
 * Check if an item is in the watched list
 */
export const isWatched = async (id: number, mediaType: string): Promise<boolean> => {
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
    return data.watched || false;
  } catch (error) {
    console.error('Error checking watched status:', error);
    return false;
  }
};

/**
 * Get all items from the watched list
 */
export const getWatchedItems = async (): Promise<WatchedItem[]> => {
  const user = getCurrentUser();
  if (!user?.id) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/user/watched`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) return [];
    
    const data = await response.json();
    console.log('Watched items récupérés depuis l\'API:', data.items?.length || 0);
    return data.items || [];
  } catch (error) {
    console.error('Error getting watched items:', error);
    return [];
  }
};

/**
 * Toggle an item in the watched list
 */
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
