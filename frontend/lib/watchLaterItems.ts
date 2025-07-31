import { MediaItem } from '@/types/tmdb';
import {
  getMediaStatus,
  getStatusItems
} from './userStatusService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// Utilisé comme `${API_BASE_URL}/api/auth/...`

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
    
    // Enrichir les données avec TMDB si nécessaire (comme pour les favoris)
    const enrichedItems = await Promise.all(items.map(async (item) => {
      // Si on a déjà le poster_path et le titre, pas besoin de faire un appel API
      if (item.poster_path && item.title) {
        return {
          id: item.mediaId,
          media_type: item.mediaType,
          title: item.title,
          name: item.title,
          poster_path: item.poster_path,
          release_date: null,
          first_air_date: null,
          added_at: new Date(item.createdAt).getTime()
        };
      }
      
      // Sinon, faire un appel à TMDB pour récupérer les détails complets
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${item.mediaType}/${item.mediaId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
        );
        const data = await res.json();
        
        return {
          id: item.mediaId,
          media_type: item.mediaType,
          title: data.title || data.name || item.title || '',
          name: data.name || data.title || item.title || '',
          poster_path: data.poster_path || item.poster_path || null,
          release_date: data.release_date || null,
          first_air_date: data.first_air_date || null,
          added_at: new Date(item.createdAt).getTime()
        };
      } catch (err) {
        console.error(`Erreur lors de l'enrichissement des données pour le média ${item.mediaId}:`, err);
        // Fallback aux données existantes
        return {
          id: item.mediaId,
          media_type: item.mediaType,
          title: item.title || '',
          name: item.title || '',
          poster_path: item.poster_path || null,
          release_date: null,
          first_air_date: null,
          added_at: new Date(item.createdAt).getTime()
        };
      }
    }));
    
    return enrichedItems;
  } catch (error) {
    console.error('Error getting watch later items:', error);
    return [];
  }
};

/**
 * Toggle an item in the watch later list
 */
export const toggleWatchLater = async (media: any, mediaType: string, userId?: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/status/toggle`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId: media.id,
        mediaType,
        status: 'WATCH_LATER',
        title: media.title || media.name,
        posterPath: media.poster_path
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle watch later status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watch-later-updated'));
      
      // If the item was added to watch later and it was in watched list, it would be removed from watched
      if (data.watchLater) {
        window.dispatchEvent(new CustomEvent('watched-updated'));
      }
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
export const removeWatchLater = async (id: number, mediaType: string, userId?: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/status/toggle`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId: id,
        mediaType,
        status: 'WATCH_LATER'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to remove from watch later: ${response.status}`);
    }
    
    console.log('Item retiré de la liste "à voir plus tard" via API');
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watch-later-updated'));
    }
  } catch (error) {
    console.error('Error removing from watch later:', error);
  }
};
