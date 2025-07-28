import { MediaItem } from '@/types/tmdb';
import { 
  getMediaStatus, 
  getStatusItems
} from './userStatusService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
    console.error('Error getting watched items:', error);
    return [];
  }
};

/**
 * Toggle an item in the watched list
 */
export const toggleWatched = async (media: any, mediaType: string, userId?: string): Promise<boolean> => {
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
        status: 'WATCHED',
        title: media.title || media.name,
        posterPath: media.poster_path
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle watched status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watched-updated'));
      
      // If the item was added to watched and it was in watch later list, it would be removed from watch later
      if (data.watched) {
        window.dispatchEvent(new CustomEvent('watch-later-updated'));
      }
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
export const removeWatched = async (id: number, mediaType: string, userId?: string): Promise<void> => {
  if (!userId) return;

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
        status: 'WATCHED'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to remove from watched: ${response.status}`);
    }
    
    console.log('Item retiré de la liste "déjà vu" via API');
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watched-updated'));
    }
  } catch (error) {
    console.error('Error removing from watched:', error);
  }
};
