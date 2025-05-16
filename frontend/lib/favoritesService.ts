"use client";

import { MediaDetails } from "@/types/tmdb";
import { safeLocalStorage } from './clientUtils';

const FAVORITES_KEY = "cinetech_favorites";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FavoriteItem {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  added_at: number; // timestamp
}

// Fonction pour vérifier si l'utilisateur est authentifié
const isUserAuthenticated = (): boolean => {
  // Vérifier la présence du cookie (sans accéder à sa valeur)
  return document.cookie.includes('auth_token=');
};

// Récupérer tous les favoris
export function getFavorites(): FavoriteItem[] {
  // Si l'utilisateur est authentifié, il faudrait récupérer les favoris depuis l'API
  // Pour l'instant, utilisation du localStorage en fallback
  return safeLocalStorage.getJSON<FavoriteItem[]>(FAVORITES_KEY, []);
}

// Vérifier si un média est en favori
export function isFavorite(id: number): boolean {
  const favorites = getFavorites();
  return favorites.some(item => item.id === id);
}

// Ajouter un média aux favoris
export async function addFavorite(media: MediaDetails): Promise<void> {
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
    
    if (isUserAuthenticated()) {
      // Dans le futur, appel API pour sauvegarder le favori dans la base de données
      // await fetch(`${API_BASE_URL}/favorites`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(favoriteItem),
      //   credentials: 'include'
      // });
    }
    
    // En attendant l'implémentation complète côté API, on utilise le localStorage
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
export async function removeFavorite(id: number): Promise<void> {
  try {
    if (isUserAuthenticated()) {
      // Dans le futur, appel API pour supprimer le favori de la base de données
      // await fetch(`${API_BASE_URL}/favorites/${id}`, {
      //   method: 'DELETE',
      //   credentials: 'include'
      // });
    }
    
    // En attendant l'implémentation complète côté API, on utilise le localStorage
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
