import { MediaItem } from '@/types/tmdb';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface WatchedItem {
  id: number;
  mediaId: number;
  mediaType: string;
  watched: boolean;
  addedAt: string; // ISO date string
  // Ces propriétés seront ajoutées par l'API TMDB
  title?: string;
  poster_path?: string | null;
}

export const getWatchedItems = async (): Promise<WatchedItem[]> => {
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
    return data.items || [];
  } catch (error) {
    console.error('Error getting watched items:', error);
    return [];
  }
};

export const isWatched = async (id: number, mediaType: string): Promise<boolean> => {
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

export const removeWatched = async (id: number, mediaType: string): Promise<void> => {
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
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('watched-updated'));
  } catch (error) {
    console.error('Error removing from watched items:', error);
  }
};

export const toggleWatched = async (media: any, mediaType: string): Promise<boolean> => {
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
    
    // Dispatch events to notify other components
    window.dispatchEvent(new CustomEvent('watched-updated'));
    
    // If item was added to watched and was in watch later, it would be removed from watch later
    if (data.watched) {
      window.dispatchEvent(new CustomEvent('watch-later-updated'));
    }
    
    return data.watched;
  } catch (error) {
    console.error('Error toggling watched status:', error);
    return false;
  }
};
  }
};
