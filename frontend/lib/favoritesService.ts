"use client";

import { MediaDetails } from "@/types/tmdb";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FavoriteItem {
  id: number;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  favorite: boolean;
  watched: boolean;
  watchLater: boolean;
  addedAt: string; // ISO date string
  // Ces propriétés seront ajoutées par l'API TMDB
  title?: string;
  poster_path?: string | null;
}

// Fonction pour obtenir l'utilisateur actuel depuis le localStorage
const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    
    const user = JSON.parse(userString);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Récupérer tous les favoris
export async function getFavorites(): Promise<FavoriteItem[]> {
  const user = getCurrentUser();
  if (!user?.id) return [];
  
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
    console.log('Favoris récupérés depuis l\'API:', data.favorites?.length || 0);
    return data.favorites || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    return [];
  }
}

// Vérifier si un média est en favori
export async function isFavorite(id: number, mediaType: string): Promise<boolean> {
  const user = getCurrentUser();
  if (!user?.id) return false;
  
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

// Ajouter ou retirer un média des favoris
export async function toggleFavorite(media: MediaDetails): Promise<boolean> {
  const user = getCurrentUser();
  if (!user?.id) return false;
  
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
    
    console.log(`Média ${data.favorite ? 'ajouté aux' : 'retiré des'} favoris via API`);
    return data.favorite;
  } catch (error) {
    console.error("Erreur lors du toggle du favori:", error);
    return false;
  }
}

// Récupérer le nombre de favoris
export async function getFavoritesCount(): Promise<number> {
  const user = getCurrentUser();
  if (!user?.id) return 0;
  
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
  const user = getCurrentUser();
  if (!user?.id) return;
  
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
    
    console.log('Favori supprimé via API');
    
    // Déclencher un événement pour informer d'autres composants
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
  }
}
