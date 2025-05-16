"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MediaItem } from '@/types/tmdb'; 
import MediaCard from '@/components/MediaCard';
import Pagination from '@/components/Pagination';
import { getWatchedItems, removeWatched, isWatched } from '@/lib/watchedItems';
import { getWatchLaterItems, removeWatchLater } from '@/lib/watchLaterItems';
import { useHasMounted } from '@/lib/clientUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

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
    const favorites = localStorage.getItem('cinetech_favorites');
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
    localStorage.setItem('cinetech_favorites', JSON.stringify(updatedFavorites));
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
};

// Composant TabButton amélioré avec position pour gérer les coins arrondis
const TabButton: React.FC<{ 
  active: boolean; 
  onClick: () => void;
  children: React.ReactNode;
  position: 'left' | 'middle' | 'right';
}> = ({ active, onClick, children, position }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 py-3 font-semibold transition-all relative
      ${position === 'left' ? 'rounded-tl-lg' : position === 'right' ? 'rounded-tr-lg' : ''}
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
          <MediaCard media={item} disableWatchedIndicator={false} />
          {onRemove && (
            <button
              onClick={() => onRemove(item.id, item.media_type)}
              className="absolute bottom-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 opacity-70 hover:opacity-100 transition-opacity"
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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Array<MediaDetails>>([]);
  const [watchedItems, setWatchedItems] = useState<Array<MediaDetails>>([]);
  const [watchLaterItems, setWatchLaterItems] = useState<Array<MediaDetails>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchLater' | 'watched'>('favorites');
  
  const hasMounted = useHasMounted();
  const router = useRouter();
  
  // Si l'utilisateur n'est pas connecté, afficher un message de connexion nécessaire
  if (hasMounted && !authLoading && !isAuthenticated) {
    return (
      <div className="container-default py-20">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 text-primary dark:text-accent">Connexion requise</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Vous devez être connecté pour accéder à vos favoris et listes personnelles.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/login"
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Se connecter
            </Link>
            <Link 
              href="/register"
              className="bg-accent text-primary px-6 py-2 rounded-md hover:bg-accent-dark transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Load favorites using API when authenticated
  const loadFavorites = useCallback(async () => {
    if (!hasMounted || !isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Ici il faudrait appeler l'API pour récupérer les favoris de l'utilisateur
      // Pour l'instant, utiliser localStorage en attendant l'implémentation complète
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
  }, [hasMounted, isAuthenticated]);

  const loadWatchedItems = useCallback(() => {
    if (!hasMounted) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const items = getWatchedItems().sort((a, b) => 
        (b.added_at || 0) - (a.added_at || 0)
      );
      setWatchedItems(items as MediaDetails[]);
      setIsLoading(false);
    } catch (err: unknown) {
      console.error('Error loading watched items:', err);
      setError('Impossible de charger vos contenus visionnés. Veuillez réessayer plus tard.');
      setIsLoading(false);
    }
  }, [hasMounted]);

  const loadWatchLaterItems = useCallback(() => {
    if (!hasMounted) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const items = getWatchLaterItems().sort((a, b) => 
        (b.added_at || 0) - (a.added_at || 0)
      );
      setWatchLaterItems(items as MediaDetails[]);
      setIsLoading(false);
    } catch (err: unknown) {
      console.error('Error loading watch later items:', err);
      setError('Impossible de charger votre liste à voir. Veuillez réessayer plus tard.');
      setIsLoading(false);
    }
  }, [hasMounted]);
  
  useEffect(() => {
    if (!hasMounted || authLoading) return;
    
    if (isAuthenticated) {
      // Reset page when changing tabs
      setCurrentPage(1);
      
      if (activeTab === 'favorites') {
        loadFavorites();
      } else if (activeTab === 'watched') {
        loadWatchedItems();
      } else {
        loadWatchLaterItems();
      }
      
      // Listen for favorites, watched items, and watch later updates
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

      const handleWatchLaterUpdated = () => {
        if (activeTab === 'watchLater') {
          loadWatchLaterItems();
        }
      };
      
      window.addEventListener('favorites-updated', handleFavoritesUpdated);
      window.addEventListener('watched-updated', handleWatchedUpdated);
      window.addEventListener('watch-later-updated', handleWatchLaterUpdated);
      
      return () => {
        window.removeEventListener('favorites-updated', handleFavoritesUpdated);
        window.removeEventListener('watched-updated', handleWatchedUpdated);
        window.removeEventListener('watch-later-updated', handleWatchLaterUpdated);
      };
    }
  }, [activeTab, loadFavorites, loadWatchedItems, loadWatchLaterItems, hasMounted, isAuthenticated, authLoading]);
  
  // Fonction pour actualiser les données
  const handleRefresh = () => {
    if (activeTab === 'favorites') {
      loadFavorites();
    } else if (activeTab === 'watched') {
      loadWatchedItems();
    } else {
      loadWatchLaterItems();
    }
  };

  const handleRemoveFavorite = (id: number, mediaType: string) => {
    removeFromFavorites(id, mediaType);
    setFavorites(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
  };

  const handleRemoveWatched = (id: number, mediaType: string) => {
    removeWatched(id, mediaType);
    setWatchedItems(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
  };

  const handleRemoveWatchLater = (id: number, mediaType: string) => {
    removeWatchLater(id, mediaType);
    setWatchLaterItems(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
  };

  let displayItems: MediaDetails[] = [];
  if (activeTab === 'favorites') {
    displayItems = favorites;
  } else if (activeTab === 'watched') {
    displayItems = watchedItems;
  } else {
    displayItems = watchLaterItems;
  }
  
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

  // If loading auth or component not mounted, show loading spinner
  if (!hasMounted || authLoading) {
    return (
      <div className="container-default py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="large" />
        </div>
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
              active={activeTab === 'watchLater'} 
              onClick={() => setActiveTab('watchLater')}
              position="middle"
            >
              À voir
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
              : activeTab === 'watched'
                ? "Films et séries que vous avez déjà visionnés."
                : "Films et séries que vous avez prévu de voir."}
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
          title={
            activeTab === 'favorites' 
              ? "Aucun favori" 
              : activeTab === 'watched' 
                ? "Aucun contenu visionné" 
                : "Aucun contenu à voir"
          }
          description={
            activeTab === 'favorites' 
              ? "Vous n'avez pas encore ajouté de favoris. Explorez les films et séries et ajoutez-les à vos favoris pour les retrouver ici."
              : activeTab === 'watched'
                ? "Vous n'avez pas encore marqué de contenus comme visionnés."
                : "Vous n'avez pas encore ajouté de contenus à votre liste à voir."
          }
          actionText="Découvrir des films et séries"
          actionLink="/trending"
        />
      ) : (
        <>
          {activeTab !== 'favorites' && (
            <div className="mb-4">
              <div className="flex items-center space-x-8 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  {activeTab === 'watched' ? (
                    <>
                      <div className="h-3 w-3 rounded-full bg-[#00C897] border border-white"></div>
                      <span>Déjà vu</span>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-3 rounded-full bg-yellow-500 border border-white"></div>
                      <span>À voir</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        
          <MediaGrid 
            items={paginatedItems}
            onRemove={
              activeTab === 'favorites' 
                ? handleRemoveFavorite 
                : activeTab === 'watched' 
                  ? handleRemoveWatched 
                  : handleRemoveWatchLater
            }
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
