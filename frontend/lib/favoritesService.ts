"use client";

import { MediaDetails } from "@/types/tmdb";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FavoriteItem {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  added_at: number; // timestamp
}

// Récupérer tous les favoris
export async function getFavorites(): Promise<FavoriteItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/favorites`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) return [];
    
    const data = await response.json();
    return data.favorites || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    return [];
  }
}

// Vérifier si un média est en favori
export async function isFavorite(id: number, mediaType: string): Promise<boolean> {
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
    return data.favorite || false;
  } catch (error) {
    console.error("Erreur lors de la vérification du favori:", error);
    return false;
  }
}

// Ajouter un média aux favoris
export async function addFavorite(media: MediaDetails): Promise<void> {
  try {
    // Déterminer le type de média
    const mediaType = media.title ? 'movie' : 'tv';
    
    const response = await fetch(`${API_BASE_URL}/user/favorites`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId: media.id,
        mediaType,
        title: media.title || media.name || 'Sans titre',
        posterPath: media.poster_path
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add favorite');
    }
    
    // Déclencher un événement pour informer d'autres composants
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
  }
}

// Supprimer un média des favoris
export async function removeFavorite(id: number, mediaType: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/favorites/${mediaType}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove favorite');
    }
    
    // Déclencher un événement pour informer d'autres composants
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
  }
}

// Toggle un favori (ajouter ou supprimer)
export async function toggleFavorite(media: MediaDetails): Promise<boolean> {
  try {
    // Déterminer le type de média
    const mediaType = media.title ? 'movie' : 'tv';
    
    const response = await fetch(`${API_BASE_URL}/user/favorites/toggle`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId: media.id,
        mediaType,
        title: media.title || media.name || 'Sans titre',
        posterPath: media.poster_path
      })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle favorite status');
    }
    
    const data = await response.json();
    
    // Déclencher un événement pour informer d'autres composants
    window.dispatchEvent(new CustomEvent('favorites-updated'));
    
    return data.isFavorite;
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
