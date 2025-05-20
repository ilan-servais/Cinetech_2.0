import { isBrowser } from './clientUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type StatusType = 'FAVORITE' | 'WATCHED' | 'WATCH_LATER';

export interface UserStatusItem {
  id: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  status: StatusType;
  createdAt: string;
  // Propriétés étendues pour l'affichage
  title?: string;
  poster_path?: string | null;
}

// Récupérer tous les statuts d'un utilisateur
export const getAllUserStatuses = async (): Promise<UserStatusItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user statuses: ${response.status}`);
    }
    
    const data = await response.json();
    return data.statuses || [];
  } catch (error) {
    console.error('Error getting user statuses:', error);
    return [];
  }
};

// Récupérer le statut d'un média spécifique
export const getMediaStatus = async (mediaId: number, mediaType: string): Promise<{
  favorite: boolean;
  watched: boolean;
  watchLater: boolean;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/status/${mediaType}/${mediaId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      return { favorite: false, watched: false, watchLater: false };
    }
    
    const data = await response.json();
    return {
      favorite: Boolean(data.favorite),
      watched: Boolean(data.watched),
      watchLater: Boolean(data.watchLater)
    };
  } catch (error) {
    console.error('Error getting media status:', error);
    return { favorite: false, watched: false, watchLater: false };
  }
};

// Ajouter ou mettre à jour un statut
export const toggleUserStatus = async (
  mediaId: number,
  mediaType: string,
  status: StatusType,
  title?: string,
  posterPath?: string | null
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/status/toggle`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId,
        mediaType,
        status,
        title,
        posterPath
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle ${status.toLowerCase()} status`);
    }
    
    const data = await response.json();
    
    // Dispatch event to notify other components
    const eventType = status.toLowerCase() === 'favorite' 
      ? 'favorites-updated' 
      : status.toLowerCase() === 'watched' 
        ? 'watched-updated' 
        : 'watch-later-updated';
        
    window.dispatchEvent(new CustomEvent(eventType));
    
    // Le statut retourné sera spécifique au type de statut
    return data[status.toLowerCase()] || false;
  } catch (error) {
    console.error(`Error toggling ${status.toLowerCase()} status:`, error);
    return false;
  }
};

// Supprimer un statut
export const removeUserStatus = async (mediaId: number, mediaType: string, status: StatusType): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/status/${status.toLowerCase()}/${mediaType}/${mediaId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to remove ${status.toLowerCase()} status`);
    }
    
    // Dispatch event to notify other components
    const eventType = status.toLowerCase() === 'favorite' 
      ? 'favorites-updated' 
      : status.toLowerCase() === 'watched' 
        ? 'watched-updated' 
        : 'watch-later-updated';
        
    window.dispatchEvent(new CustomEvent(eventType));
  } catch (error) {
    console.error(`Error removing ${status.toLowerCase()} status:`, error);
  }
};

// Récupérer tous les médias avec un statut spécifique
export const getStatusItems = async (status: StatusType): Promise<UserStatusItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${status.toLowerCase()}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${status} items: ${response.status}`);
    }
    
    const data = await response.json();
    const key = status.toLowerCase() === 'favorite' ? 'favorites' : 'items';
                
    return data[key] || [];
  } catch (error) {
    console.error(`Error getting ${status.toLowerCase()} items:`, error);
    return [];
  }
};
