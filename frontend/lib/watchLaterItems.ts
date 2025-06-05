import { MediaItem } from '@/types/tmdb';
import { removeWatched, isWatched } from './watchedItems';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface WatchLaterItem extends MediaItem {
  media_type: string;
  addedAt: number;
  release_year?: number; // année de sortie
}

/**
 * Check if an item is in the watch later list
 */
export const isWatchLater = async (id: number, mediaType: string): Promise<boolean> => {
  try {
    const watchLaterItems = await getWatchLaterItems();
    return watchLaterItems.some((item) => item.id === id && item.media_type === mediaType);
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
    const response = await fetch(`${API_BASE_URL}/user/status/watchlater`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la liste à voir: ${response.status}`);
    }
    
    const watchLaterItems = await response.json();
    return watchLaterItems.map((item: any) => ({
      id: item.mediaId,
      title: item.title || 'Sans titre',
      poster_path: item.posterPath,
      media_type: item.mediaType,
      addedAt: new Date(item.addedAt).getTime(),
      release_year: item.releaseYear
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
    // Vérifier si l'élément est déjà dans la liste à voir
    const isAlreadyAdded = await isWatchLater(media.id, mediaType);
    
    // Vérifier si l'élément est déjà dans la liste des éléments regardés
    const wasWatched = await isWatched(media.id, mediaType);
    if (wasWatched) {
      await removeWatched(media.id, mediaType);
      // Dispatch event to notify components that watched list changed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('watched-updated'));
      }
    }
    
    if (isAlreadyAdded) {
      // Supprimer de la liste à voir
      await removeWatchLater(media.id, mediaType);
      return false;
    } else {
      // Ajouter à la liste à voir
      const response = await fetch(`${API_BASE_URL}/user/status/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mediaId: media.id,
          mediaType,
          status: 'WATCH_LATER',
          title: media.title || media.name || 'Sans titre',
          posterPath: media.poster_path,
          releaseDate: media.release_date || media.first_air_date
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de l'ajout à la liste à voir: ${response.status}`);
      }
      
      // Dispatch events to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('watch-later-updated'));
      }
      
      return true;
    }  } catch (error) {
    console.error('Error toggling watch later status:', error);
    return await isWatchLater(media.id, mediaType);
  }
};

/**
 * Remove an item from the watch later list
 */
export const removeWatchLater = async (id: number, mediaType: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/status/watchlater/${mediaType}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression de la liste à voir: ${response.status}`);
    }
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watch-later-updated'));
    }
  } catch (error) {
    console.error('Error removing from watch later:', error);
  }
};
