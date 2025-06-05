"use client";

import { MediaDetails } from "@/types/tmdb";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FavoriteItem {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  addedAt: number; // timestamp
  release_year?: number; // année de sortie
}

// Récupérer tous les favoris depuis l'API
export async function getFavorites(): Promise<FavoriteItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/status/favorites`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des favoris: ${response.status}`);
    }
    
    const favorites = await response.json();
    return favorites.map((item: any) => ({
      id: item.mediaId,
      title: item.title || 'Sans titre',
      poster_path: item.posterPath,
      media_type: item.mediaType,
      addedAt: new Date(item.addedAt).getTime(),
      release_year: item.releaseYear
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    return [];
  }
}

// Vérifier si un média est en favori via l'API
export async function isFavorite(mediaId: number): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    return favorites.some(item => item.id === mediaId);
  } catch (error) {
    console.error("Erreur lors de la vérification des favoris:", error);
    return false;
  }
}

// Ajouter un média aux favoris via l'API
export async function addFavorite(media: MediaDetails): Promise<void> {
  try {
    // Déterminer le type de média
    const mediaType = media.title ? 'movie' : 'tv';
    
    // Appel API pour sauvegarder le favori dans la base de données
    const response = await fetch(`${API_BASE_URL}/user/status/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mediaId: media.id,
        mediaType,
        status: 'FAVORITE',
        title: media.title || media.name || 'Sans titre',
        posterPath: media.poster_path,
        releaseDate: media.release_date || media.first_air_date
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de l'ajout aux favoris: ${response.status}`);
    }
    
    // Déclencher un événement pour informer d'autres composants
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favorites-updated'));
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
  }
}

// Supprimer un média des favoris via l'API
export async function removeFavorite(mediaId: number, mediaType: string): Promise<void> {
  try {
    // Appel API pour supprimer le favori de la base de données
    const response = await fetch(`${API_BASE_URL}/user/status/favorites/${mediaType}/${mediaId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression des favoris: ${response.status}`);
    }
    
    // Déclencher un événement pour informer d'autres composants
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favorites-updated'));
    }
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
  }
}

// Récupérer le nombre de favoris via l'API
export async function getFavoritesCount(): Promise<number> {
  try {
    const favorites = await getFavorites();
    return favorites.length;
  } catch (error) {
    console.error("Erreur lors du comptage des favoris:", error);
    return 0;
  }
}
