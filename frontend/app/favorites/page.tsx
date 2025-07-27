"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MediaItem } from '@/types/tmdb'; 
import MediaCard from '@/components/MediaCard';
import Pagination from '@/components/Pagination';
import { getWatchedItems, removeWatched } from '@/lib/watchedItems';
import { getWatchLaterItems, removeWatchLater } from '@/lib/watchLaterItems';
import { getFavorites, removeFavorite } from '@/lib/favoritesService';
import { useHasMounted } from '@/lib/clientUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { useProtectedPage } from '@/hooks/useProtectedPage';
import MediaList from '@/components/MediaList';

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
              aria-label="Retirer de la liste"
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

// 🎯 ONBOARDING POUR UTILISATEURS NON CONNECTÉS
const FavoritesOnboarding: React.FC = () => {
  return (
    <div className="container-default py-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary dark:text-white">
            Gérez votre bibliothèque cinéma
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Créez votre compte pour organiser vos films et séries favoris, 
            suivre ce que vous avez déjà vu et planifier vos prochaines découvertes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Favoris</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sauvegardez vos films et séries préférés pour les retrouver facilement
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-green-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Déjà vus</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Marquez ce que vous avez déjà regardé et gardez un historique complet
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-yellow-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">À voir</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Créez votre liste de films et séries à découvrir prochainement
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary to-accent p-8 rounded-lg text-white">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Prêt à commencer votre voyage cinéma ?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Rejoignez des milliers d'utilisateurs qui organisent déjà leur passion du cinéma
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors inline-block"
            >
              Créer un compte gratuit
            </Link>
            <Link 
              href="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold py-3 px-8 rounded-lg transition-colors inline-block"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>

        {/* Additional Benefits */}
        <div className="mt-12 text-left">
          <h3 className="text-2xl font-bold mb-6 text-center dark:text-white">
            Pourquoi créer un compte ?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="text-green-500 mt-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">Synchronisation multi-appareils</h4>
                <p className="text-gray-600 dark:text-gray-300">Accédez à vos listes depuis n'importe quel appareil</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-green-500 mt-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">Recommandations personnalisées</h4>
                <p className="text-gray-600 dark:text-gray-300">Découvrez de nouveaux contenus basés sur vos goûts</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-green-500 mt-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">Statistiques détaillées</h4>
                <p className="text-gray-600 dark:text-gray-300">Suivez vos habitudes de visionnage et vos découvertes</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-green-500 mt-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">Partage social</h4>
                <p className="text-gray-600 dark:text-gray-300">Partagez vos découvertes avec vos amis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🛡️ COMPOSANT PRINCIPAL AVEC ONBOARDING POUR NON-CONNECTÉS
export default function FavoritesPage() {
  const { user, loading, initialized } = useAuth();
  const hasMounted = useHasMounted();

  // 1️⃣ ATTENDRE le montage côté client
  if (!hasMounted) {
    return (
      <div className="container-default py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  // 2️⃣ ATTENDRE l'initialisation du context
  if (!initialized || loading) {
    return (
      <div className="container-default py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  // 3️⃣ AFFICHAGE CONDITIONNEL selon l'état d'authentification
  if (!user) {
    return <FavoritesOnboarding />;
  }

  // 4️⃣ UTILISATEUR AUTHENTIFIÉ - Contenu principal
  return <FavoritesPageContent />;
}

// 📄 CONTENU DE LA PAGE (UNIQUEMENT ACCESSIBLE AUX UTILISATEURS AUTHENTIFIÉS)
function FavoritesPageContent() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Array<MediaDetails>>([]);
  const [watchedItems, setWatchedItems] = useState<Array<MediaDetails>>([]);
  const [watchLaterItems, setWatchLaterItems] = useState<Array<MediaDetails>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchLater' | 'watched'>('favorites');
  
  const hasMounted = useHasMounted();
  
  // Load favorites using API when authenticated
  const loadFavorites = useCallback(async () => {
    if (!hasMounted || !isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const favItems: any[] = await getFavorites(); // si tu ne veux pas encore typer précisément

      const enrichedFavorites = favItems.map((item): MediaDetails => ({
        ...item,
        media_type: item.mediaType, // ✅ Adaptation pour correspondre à MediaDetails
      }));

      setFavorites(enrichedFavorites);
    } catch (err: unknown) {
      console.error('Error loading favorites:', err);
      setError('Impossible de charger vos favoris. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, [hasMounted, isAuthenticated]);

  const loadWatchedItems = useCallback(async () => {
    if (!hasMounted || !isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await getWatchedItems();
      setWatchedItems(items as MediaDetails[]);
    } catch (err: unknown) {
      console.error('Error loading watched items:', err);
      setError('Impossible de charger vos contenus visionnés. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, [hasMounted, isAuthenticated]);

  const loadWatchLaterItems = useCallback(async () => {
    if (!hasMounted || !isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await getWatchLaterItems();
      setWatchLaterItems(items as MediaDetails[]);
    } catch (err: unknown) {
      console.error('Error loading watch later items:', err);
      setError('Impossible de charger votre liste à voir. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, [hasMounted, isAuthenticated]);
  
  useEffect(() => {
    if (!hasMounted) return;
    
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
  }, [activeTab, loadFavorites, loadWatchedItems, loadWatchLaterItems, hasMounted, isAuthenticated]);
  
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

  const handleRemoveFavorite = async (id: number, mediaType: string) => {
    try {
      await removeFavorite(id, mediaType);
      setFavorites(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleRemoveWatched = async (id: number, mediaType: string) => {
    try {
      await removeWatched(id, mediaType);
      setWatchedItems(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
    } catch (error) {
      console.error('Error removing watched item:', error);
    }
  };  

  const handleRemoveWatchLater = async (id: number, mediaType: string) => {
    try {
      await removeWatchLater(id, mediaType);
      setWatchLaterItems(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
    } catch (error) {
      console.error('Error removing watch later item:', error);
    }
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
