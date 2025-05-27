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
    
    return items.map(item => ({
      id: item.mediaId,
      mediaId: item.mediaId,
      mediaType: item.mediaType as 'movie' | 'tv',
      favorite: true,
      watched: false,
      watchLater: false,
      addedAt: item.createdAt,
      title: item.title || '',
      poster_path: item.poster_path || null
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    return [];
  }
}

// Vérifier si un média est en favori
export async function isFavorite(id: number, mediaType: string): Promise<boolean> {
  try {
    const status = await getMediaStatus(id, mediaType);
    return status.favorite;
  } catch (error) {
    console.error("Erreur lors de la vérification du favori:", error);
    return false;
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
