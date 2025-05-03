type MediaType = 'movie' | 'tv';

interface FavoriteItem {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  date?: string | null;
}

const STORAGE_KEY = 'favorites';

// Get all favorites from localStorage
export const getFavorites = (): FavoriteItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const favorites = localStorage.getItem(STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Failed to get favorites:', error);
    return [];
  }
};

// Add an item to favorites
export const addToFavorites = (item: FavoriteItem): boolean => {
  try {
    const favorites = getFavorites();
    
    // Check if already in favorites
    const exists = favorites.some(
      fav => fav.id === item.id && fav.mediaType === item.mediaType
    );
    
    if (exists) return false;
    
    const updatedFavorites = [...favorites, item];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
    
    // Dispatch event for components to listen to
    window.dispatchEvent(new Event('favorites-updated'));
    
    return true;
  } catch (error) {
    console.error('Failed to add favorite:', error);
    return false;
  }
};

// Remove an item from favorites
export const removeFromFavorites = (id: number, mediaType: MediaType): boolean => {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(
      item => !(item.id === id && item.mediaType === mediaType)
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
    
    // Dispatch event for components to listen to
    window.dispatchEvent(new Event('favorites-updated'));
    
    return true;
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    return false;
  }
};

// Check if an item is in favorites
export const isFavorite = (id: number, mediaType: MediaType): boolean => {
  const favorites = getFavorites();
  return favorites.some(item => item.id === id && item.mediaType === mediaType);
};

// Get the count of favorite items
export const getFavoritesCount = (): number => {
  return getFavorites().length;
};
