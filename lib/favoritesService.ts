"use client";

import { MediaDetails } from "@/types/tmdb";
import { safeLocalStorage } from './clientUtils';

const FAVORITES_KEY = "cinetech_favorites";

interface FavoriteItem {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  added_at: number; // timestamp
}

// Récupérer tous les favoris
export function getFavorites(): FavoriteItem[] {
  return safeLocalStorage.getJSON<FavoriteItem[]>(FAVORITES_KEY, []);
}

// Vérifier si un média est en favori
export function isFavorite(id: number): boolean {
  const favorites = getFavorites();
  return favorites.some(item => item.id === id);
}

// Ajouter un média aux favoris
export function addFavorite(media: MediaDetails): void {
  try {
    const favorites = getFavorites();
    
    // Vérifier si le média existe déjà dans les favoris
    if (favorites.some(item => item.id === media.id)) {
      return;
    }
    
    // Déterminer le type de média
    const mediaType = media.title ? 'movie' : 'tv';
    
    // Créer l'objet favori
    const favoriteItem: FavoriteItem = {
      id: media.id,
      title: media.title || media.name || 'Sans titre',
      poster_path: media.poster_path,
      media_type: mediaType as 'movie' | 'tv',
      added_at: Date.now()
    };
    
    // Ajouter le nouveau favori et sauvegarder
    const updatedFavorites = [...favorites, favoriteItem];
    safeLocalStorage.setJSON(FAVORITES_KEY, updatedFavorites);
    
    // Déclencher un événement pour informer d'autres composants
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favorites-updated'));
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
  }
}

// Supprimer un média des favoris
export function removeFavorite(id: number): void {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(item => item.id !== id);
    
    safeLocalStorage.setJSON(FAVORITES_KEY, updatedFavorites);
    
    // Déclencher un événement pour informer d'autres composants
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favorites-updated'));
    }
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
  }
}

// Récupérer le nombre de favoris
export function getFavoritesCount(): number {
  return getFavorites().length;
}
