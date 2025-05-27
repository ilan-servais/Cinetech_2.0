"use client";

import { getMediaStatus } from './userStatusService';
import { MediaDetails } from "@/types/tmdb";
import {  
  toggleUserStatus, 
  removeUserStatus,
  getStatusItems
} from './userStatusService';

interface FavoriteItem {
  id: number;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  favorite: boolean;
  watched: boolean;
  watchLater: boolean;
  addedAt: string;
  title?: string;
  poster_path?: string | null;
}

// Récupérer tous les favoris
export async function getFavorites(): Promise<FavoriteItem[]> {
  try {
    const items = await getStatusItems('FAVORITE');
    console.log('Favoris récupérés depuis l\'API:', items.length);

    const enrichedItems = await Promise.all(items.map(async (item) => {
      if (item.poster_path && item.title) {
        return {
          id: item.mediaId,
          mediaId: item.mediaId,
          mediaType: item.mediaType as 'movie' | 'tv',
          favorite: true,
          watched: false,
          watchLater: false,
          addedAt: item.createdAt,
          title: item.title,
          poster_path: item.poster_path
        };
      }

      // Sinon, appel TMDB pour enrichir
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${item.mediaType}/${item.mediaId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`);
        const data = await res.json();

        return {
          id: item.mediaId,
          mediaId: item.mediaId,
          mediaType: item.mediaType as 'movie' | 'tv',
          favorite: true,
          watched: false,
          watchLater: false,
          addedAt: item.createdAt,
          title: data.title || data.name || 'Titre inconnu',
          poster_path: data.poster_path || null
        };
      } catch (err) {
        console.error("Erreur enrichissement TMDB pour le média", item.mediaId, err);
        return {
          id: item.mediaId,
          mediaId: item.mediaId,
          mediaType: item.mediaType as 'movie' | 'tv',
          favorite: true,
          watched: false,
          watchLater: false,
          addedAt: item.createdAt,
          title: item.title || 'Titre inconnu',
          poster_path: item.poster_path || null
        };
      }
    }));

    return enrichedItems;
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    return [];
  }
}

// Ajouter ou retirer un média des favoris
export async function toggleFavorite(media: MediaDetails): Promise<boolean> {
  try {
    const mediaType = media.title ? 'movie' : 'tv';

    const result = await toggleUserStatus(
      media.id, 
      mediaType, 
      'FAVORITE',
      media.title || media.name || 'Sans titre',
      media.poster_path
    );

    window.dispatchEvent(new CustomEvent('favorites-updated'));
    console.log(`Média ${result ? 'ajouté aux' : 'retiré des'} favoris via API`);
    return result;
  } catch (error) {
    console.error("Erreur lors du toggle du favori:", error);
    return false;
  }
}

// Récupérer le nombre de favoris
export async function getFavoritesCount(): Promise<number> {
  try {
    const favorites = await getFavorites();
    return favorites.length;
  } catch (error) {
    console.error("Erreur lors du comptage des favoris:", error);
    return 0;
  }
}

// Supprimer un média des favoris
export async function removeFavorite(id: number, mediaType: string): Promise<void> {
  try {
    await removeUserStatus(id, mediaType, 'FAVORITE');
    console.log('Favori supprimé via API');
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
  }
}
