import { MediaItem } from '@/types/tmdb';
import { removeWatchLater, isWatchLater } from './watchLaterItems';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface WatchedItem extends MediaItem {
  media_type: string;
  addedAt: number;
  release_year?: number; // année de sortie
}

export const getWatchedItems = async (): Promise<WatchedItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/status/watched`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des éléments regardés: ${response.status}`);
    }
    
    const watchedItems = await response.json();
    return watchedItems.map((item: any) => ({
      id: item.mediaId,
      title: item.title || 'Sans titre',
      poster_path: item.posterPath,
      media_type: item.mediaType,
      addedAt: new Date(item.addedAt).getTime(),
      release_year: item.releaseYear
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des éléments regardés:', error);
    return [];
  }
};

export const isWatched = async (id: number, mediaType: string): Promise<boolean> => {
  try {
    const watchedItems = await getWatchedItems();
    return watchedItems.some(item => item.id === id && item.media_type === mediaType);
  } catch (error) {
    console.error('Erreur lors de la vérification du statut regardé:', error);
    return false;
  }
};

export const removeWatched = async (id: number, mediaType: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/status/watched/${mediaType}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression de l'élément regardé: ${response.status}`);
    }
    
    // Dispatch a custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watched-updated'));
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'élément regardé:', error);
  }
};

export const toggleWatched = async (media: any, mediaType: string): Promise<boolean> => {
  try {
    // Vérifier si l'élément est déjà marqué comme regardé
    const isAlreadyWatched = await isWatched(media.id, mediaType);
    
    if (isAlreadyWatched) {
      // Supprimer de la liste des éléments regardés
      await removeWatched(media.id, mediaType);
      
      // Dispatch event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('watched-updated'));
      }
      return false;
    } else {
      // Ajouter à la liste des éléments regardés
      const response = await fetch(`${API_BASE_URL}/user/status/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mediaId: media.id,
          mediaType,
          status: 'WATCHED',
          title: media.title || media.name || 'Sans titre',
          posterPath: media.poster_path,
          releaseDate: media.release_date || media.first_air_date
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de l'ajout à la liste des éléments regardés: ${response.status}`);
      }
      
      // Supprimer de la liste à voir si nécessaire
      if (await isWatchLater(media.id, mediaType)) {
        await removeWatchLater(media.id, mediaType);
      }
      
      // Dispatch events to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('watched-updated'));
        window.dispatchEvent(new CustomEvent('watch-later-updated'));
      }
      
      return true;
    }  } catch (error) {
    console.error('Error toggling watched status:', error);
    return await isWatched(media.id, mediaType);
  }
};
