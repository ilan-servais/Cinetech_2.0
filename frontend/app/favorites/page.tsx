"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MediaItem } from '@/types/tmdb'; 
import MediaCard from '@/components/MediaCard';
import Pagination from '@/components/Pagination';
import { getWatchedItems } from '@/lib/watchedItems';

// Étendre l'interface MediaDetails pour inclure toutes les propriétés nécessaires
interface MediaDetails extends MediaItem {
  media_type: string;
  adult?: boolean;
  backdrop_path?: string | null;
  genre_ids?: number[];
  original_language?: string;
  original_title?: string;
  overview?: string;
  popularity?: number;
  release_date?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
  added_at?: number;
}

// Fonction corrigée pour récupérer les favoris
const getFavorites = (): MediaDetails[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const favorites = localStorage.getItem('favorites');
    if (!favorites) return [];
    
    return JSON.parse(favorites);
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

const removeFromFavorites = (id: number, mediaType: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(
      item => !(item.id === id && item.media_type === mediaType)
    );
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
};

const TabButton: React.FC<{ 
  active: boolean; 
  onClick: () => void;
  children: React.ReactNode;
  position: 'left' | 'right';
}> = ({ active, onClick, children, position }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 py-3 font-semibold transition-all relative
      ${position === 'left' ? 'rounded-tl-lg' : 'rounded-tr-lg'}
      ${active 
        ? 'text-primary border-t-2 border-[#01B4E4] dark:text-[#01B4E4]' 
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}
    `}
  >
    {children}
  </button>
);

const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
}> = ({ title, description, actionText, actionLink }) => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-2 dark:text-white">{title}</h2>
      <p className="text-gray-600 mb-6 dark:text-gray-300">{description}</p>
      {actionText && actionLink && (
        <a href={actionLink} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-accent hover:text-primary transition-colors">
          {actionText}
        </a>
      )}
    </div>
  );
};

const MediaGrid: React.FC<{
  items: MediaDetails[];
  onRemove?: (id: number, mediaType: string) => void;
}> = ({ items, onRemove }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {items.map(item => (
        <div key={`${item.id}-${item.media_type}`} className="relative">
          <MediaCard media={item} disableWatchedIndicator={true} />
          {onRemove && (
            <button
              onClick={() => onRemove(item.id, item.media_type)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10"
              aria-label="Retirer des favoris"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const ITEMS_PER_PAGE = 12;

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Array<MediaDetails>>([]);
  const [watchedItems, setWatchedItems] = useState<Array<MediaDetails>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'favorites' | 'watched'>('favorites');
  const [hasMounted, setHasMounted] = useState(false);
  
  const router = useRouter();
  
  // Mark component as mounted to prevent hydration issues
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  const loadFavorites = useCallback(() => {
    if (!hasMounted) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const favItems = getFavorites().sort((a, b) => 
        (b.added_at || 0) - (a.added_at || 0)
      );
      setFavorites(favItems);
    } catch (err: unknown) {
      console.error('Error loading favorites:', err);
      setError('Impossible de charger vos favoris. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, [hasMounted]);

  const loadWatchedItems = useCallback(() => {
    if (!hasMounted) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const items = getWatchedItems().sort((a, b) => 
        (b.added_at || 0) - (a.added_at || 0)
      );
      setWatchedItems(items as MediaDetails[]);
    } catch (err: unknown) {
      console.error('Error loading watched items:', err);
      setError('Impossible de charger vos contenus visionnés. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, [hasMounted]);
  
  useEffect(() => {
    if (!hasMounted) return;
    
    // Reset page when changing tabs
    setCurrentPage(1);
    
    if (activeTab === 'favorites') {
      loadFavorites();
    } else {
      loadWatchedItems();
    }
    
    // Listen for favorites and watched items updates
    const handleFavoritesUpdated = () => {
      if (activeTab === 'favorites') {
        loadFavorites();
      }
    };

    const handleWatchedUpdated = () => {
      if (activeTab === 'watched') {
        loadWatchedItems();
      }
    };
    
    window.addEventListener('favorites-updated', handleFavoritesUpdated);
    window.addEventListener('watched-updated', handleWatchedUpdated);
    
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdated);
      window.removeEventListener('watched-updated', handleWatchedUpdated);
    };
  }, [activeTab, loadFavorites, loadWatchedItems, hasMounted]);
  
  const handleRefresh = () => {
    if (activeTab === 'favorites') {
      loadFavorites();
    } else {
      loadWatchedItems();
    }
  };
  
  const handleRemoveFavorite = (id: number, mediaType: string) => {
    removeFromFavorites(id, mediaType);
    setFavorites(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
  };
  
  const displayItems = activeTab === 'favorites' ? favorites : watchedItems;
  const totalPages = Math.ceil(displayItems.length / ITEMS_PER_PAGE);
  const paginatedItems = displayItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll smoothly back to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not mounted yet, return a simple placeholder with matching structure
  // This prevents hydration errors by having a consistent structure
  if (!hasMounted) {
    return (
      <div className="container-default py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary dark:text-white">
            Ma bibliothèque
          </h1>
          <div className="mb-6 border-b dark:border-gray-700">
            <div className="flex rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-800 w-full">
              <div className="flex-1 py-3 font-semibold rounded-tl-lg">Favoris</div>
              <div className="flex-1 py-3 font-semibold rounded-tr-lg">Déjà vus</div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="container-default animate-fade-in py-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary dark:text-white">
          Ma bibliothèque
        </h1>
        <div className="mb-6 border-b dark:border-gray-700">
          <div className="flex rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-800 w-full">
            <TabButton 
              active={activeTab === 'favorites'} 
              onClick={() => setActiveTab('favorites')}
              position="left"
            >
              Favoris
            </TabButton>
            <TabButton 
              active={activeTab === 'watched'} 
              onClick={() => setActiveTab('watched')}
              position="right"
            >
              Déjà vus
            </TabButton>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-300">
            {activeTab === 'favorites' 
              ? "Retrouvez ici tous vos films et séries favoris."
              : "Films et séries que vous avez déjà visionnés."}
          </p>
          <button 
            onClick={handleRefresh}
            className="text-[#01B4E4] hover:underline text-sm flex items-center"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Actualiser
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="my-20 flex justify-center">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:text-red-100 dark:border-red-800">
          {error}
        </div>
      ) : paginatedItems.length === 0 ? (
        <EmptyState 
          title={activeTab === 'favorites' ? "Aucun favori" : "Aucun contenu visionné"}
          description={
            activeTab === 'favorites' 
              ? "Vous n'avez pas encore ajouté de favoris. Explorez les films et séries et ajoutez-les à vos favoris pour les retrouver ici."
              : "Vous n'avez pas encore marqué de contenus comme visionnés."
          }
          actionText="Découvrir des films et séries"
          actionLink="/trending"
        />
      ) : (
        <>
          {activeTab === 'watched' && (
            <div className="mb-4">
              <div className="flex items-center space-x-8 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-[#00C897] border border-white"></div>
                  <span>Déjà vu</span>
                </div>
              </div>
            </div>
          )}
        
          <MediaGrid 
            items={paginatedItems}
            onRemove={activeTab === 'favorites' ? handleRemoveFavorite : undefined}
          />
          
          {/* Pagination using the global Pagination component */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={1}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
