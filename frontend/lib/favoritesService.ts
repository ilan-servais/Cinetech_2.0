"use client";

import { MediaDetails } from "@/types/tmdb";

const FAVORITES_KEY = "cinetech_favorites";

interface FavoriteItem {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  added_at: number; // timestamp
}

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Récupérer tous les favoris
export function getFavorites(): FavoriteItem[] {
  if (!isClient) return [];
  
  try {
    const favoritesJson = localStorage.getItem(FAVORITES_KEY);
    if (!favoritesJson) return [];
    
    return JSON.parse(favoritesJson);
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    return [];
  }
}

// Vérifier si un média est en favori
export function isFavorite(id: number): boolean {
  if (!isClient) return false;
  
  const favorites = getFavorites();
  return favorites.some(item => item.id === id);
}

// Ajouter un média aux favoris
export function addFavorite(media: MediaDetails): void {
  if (!isClient) return;
  
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
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    
    // Déclencher un événement pour informer d'autres composants
    window.dispatchEvent(new Event('favorites-updated'));
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
  }
}

// Supprimer un média des favoris
export function removeFavorite(id: number): void {
  if (!isClient) return;
  
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(item => item.id !== id);
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    
    // Déclencher un événement pour informer d'autres composants
    window.dispatchEvent(new Event('favorites-updated'));
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
  }
}

// Récupérer le nombre de favoris
export function getFavoritesCount(): number {
  if (!isClient) return 0;
  return getFavorites().length;
}
