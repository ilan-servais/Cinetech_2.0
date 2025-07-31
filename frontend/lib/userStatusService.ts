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
    const response = await fetch(`${API_BASE_URL}/api/user/status`, {
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
  // 🔍 DEBUG: Log des paramètres envoyés
  console.log('🔍 DEBUG getMediaStatus Frontend - Paramètres:', {
    mediaId,
    'typeof mediaId': typeof mediaId,
    mediaType,
    'typeof mediaType': typeof mediaType,
    url: `${API_BASE_URL}/api/user/status/${mediaType}/${mediaId}`,
    timestamp: new Date().toISOString()
  });

  // 🔍 DEBUG: Vérifier si le document a des cookies
  if (typeof document !== 'undefined') {
    console.log('🔍 DEBUG Frontend cookies:', document.cookie);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/user/status/${mediaType}/${mediaId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('🔍 DEBUG getMediaStatus Frontend - Response status:', response.status);

    if (!response.ok) {
      console.warn(`Failed to get media status: ${response.status}`);
      const errorText = await response.text();
      console.warn('🔍 DEBUG getMediaStatus Frontend - Error response:', errorText);
      return { favorite: false, watched: false, watchLater: false };
    }
    
    const data = await response.json();
    console.log('🔍 DEBUG getMediaStatus Frontend - Response data:', data);
    console.log('Media status response:', data);
    
    // Gérer les deux formats possibles de clés (underscore et camelCase)
    return {
      favorite: Boolean(data.favorite),
      watched: Boolean(data.watched),
      watchLater: Boolean(data.watchLater ?? data.watch_later)
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
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[${requestId}] 🔄 Toggling ${status} for media ${mediaId} (${mediaType})`);
  
  try {
    // Log request details
    const payload = {
      mediaId,
      mediaType,
      status,
      title,
      posterPath
    };
    
    console.log(`[${requestId}] 📤 Request payload:`, JSON.stringify(payload));
    
    const response = await fetch(`${API_BASE_URL}/api/user/status/toggle`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] ❌ Failed to toggle ${status}: ${response.status}`, errorText);
      throw new Error(`Failed to toggle ${status.toLowerCase()} status`);
    }
    
    const data = await response.json();
    console.log(`[${requestId}] 📥 Toggle ${status} response:`, data);
    
    // Get the correct status key from response
    let statusKey = status.toLowerCase();
    if (statusKey === 'watch_later') statusKey = 'watchLater';
    
    // Vérifier toutes les formes possibles de la clé dans la réponse
    // Le backend peut renvoyer soit watch_later, soit watchLater, ou les deux
    const statusValue = data[statusKey] ?? data.watchLater ?? data.watch_later;
    const result = Boolean(statusValue);
    
    console.log(`[${requestId}] 🔑 Clés trouvées dans la réponse:`, Object.keys(data));
    console.log(`[${requestId}] 🔎 Valeur trouvée pour ${statusKey}:`, statusValue);
    
    // Dispatch event to notify other components
    const eventType = status === 'FAVORITE' 
      ? 'favorites-updated' 
      : status === 'WATCHED' 
        ? 'watched-updated' 
        : 'watch-later-updated';
        
    if (isBrowser()) {
      console.log(`[${requestId}] 📢 Dispatching event: ${eventType}`);
      window.dispatchEvent(new CustomEvent(eventType));
    }
    
    console.log(`[${requestId}] ✅ Final ${status} status: ${result}`);
    return result;
  } catch (error) {
    console.error(`[${requestId}] 💥 Error toggling ${status.toLowerCase()} status:`, error);
    return false;
  }
};

// Supprimer un statut
export const removeUserStatus = async (mediaId: number, mediaType: string, status: StatusType): Promise<boolean> => {
  console.log(`Removing ${status} for media ${mediaId} (${mediaType})`);
  
  try {
    // Convert status to route-friendly format
    const statusParam = status.toLowerCase().replace('_', '');
    
    const routeMap = {
      FAVORITE: 'favorites',
      WATCHED: 'watched',
      WATCH_LATER: 'watchlater',
    };

    const route = routeMap[status];

    const response = await fetch(`${API_BASE_URL}/api/user/status/${route}/${mediaType}/${mediaId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to remove ${status}: ${response.status}`, errorText);
      throw new Error(`Failed to remove ${status.toLowerCase()} status`);
    }
    
    const data = await response.json();
    console.log(`Remove ${status} response:`, data);
    
    // Dispatch event to notify other components
    const eventType = status === 'FAVORITE' 
      ? 'favorites-updated' 
      : status === 'WATCHED' 
        ? 'watched-updated' 
        : 'watch-later-updated';
        
    if (isBrowser()) {
      window.dispatchEvent(new CustomEvent(eventType));
    }
    
    return true;
  } catch (error) {
    console.error(`Error removing ${status.toLowerCase()} status:`, error);
    return false;
  }
};

// Récupérer tous les médias avec un statut spécifique
export const getStatusItems = async (status: StatusType): Promise<UserStatusItem[]> => {
  try {
    // Map status types to route endpoints
    const routeMap = {
      'FAVORITE': 'favorites',
      'WATCHED': 'watched',
      'WATCH_LATER': 'watchlater'
    };
    
    const route = routeMap[status];
    
    if (!route) {
      throw new Error(`Invalid status type: ${status}`);
    }

    const response = await fetch(`${API_BASE_URL}/api/user/${route}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${status} items: ${response.status}`);
      throw new Error(`Failed to fetch ${status} items: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Retrieved ${status} items:`, data);
    
    // Different response structures based on endpoint
    const key = status === 'FAVORITE' ? 'favorites' : 'items';
                
    return data[key] || [];
  } catch (error) {
    console.error(`Error getting ${status.toLowerCase()} items:`, error);
    return [];
  }
};
