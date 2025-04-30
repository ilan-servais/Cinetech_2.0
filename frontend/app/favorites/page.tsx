"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MediaItem } from '@/types/tmdb'; 
import MediaCard from '@/components/MediaCard';

// Étendre l'interface MediaDetails pour inclure toutes les propriétés nécessaires
interface MediaDetails extends MediaItem {
  media_type: string;
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

const getFavorites = (): Array<{id: number, title: string, media_type: string, poster_path: string}> => {
  if (typeof window === 'undefined') return [];
  
  try {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

const getMediaDetails = async (id: number, mediaType: string): Promise<MediaDetails> => {
  const favItems = getFavorites();
  const item = favItems.find(fav => fav.id === id && fav.media_type === mediaType);
  
  if (!item) {
    throw new Error(`Media not found: ${mediaType} ${id}`);
  }
  
  return {
    id,
    title: item.title,
    poster_path: item.poster_path,
    media_type: mediaType,
    adult: false,
    backdrop_path: null,
    genre_ids: [],
    original_language: '',
    original_title: '',
    overview: '',
    popularity: 0,
    release_date: '',
    video: false,
    vote_average: 0,
    vote_count: 0
  };
};

const removeFromFavorites = (id: number, mediaType: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(
      item => !(item.id === id && item.media_type === mediaType)
    );
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
};

const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
}> = ({ title, description, actionText, actionLink }) => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      {actionText && actionLink && (
        <a href={actionLink} className="btn-primary">
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
          <MediaCard media={item} />
          {onRemove && (
            <button
              onClick={() => onRemove(item.id, item.media_type)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const router = useRouter();
  
  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const favItems = getFavorites();
      
      if (favItems.length === 0) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }
      
      const detailsPromises = favItems.map((fav: {id: number, media_type: string, title: string, poster_path: string}) => 
        getMediaDetails(fav.id, fav.media_type)
          .catch((err: Error) => {
            console.error(`Error fetching details for ${fav.media_type} ${fav.id}:`, err);
            return {
              id: fav.id,
              title: fav.title,
              poster_path: fav.poster_path,
              media_type: fav.media_type,
              adult: false,
              backdrop_path: null,
              genre_ids: [],
              original_language: '',
              original_title: '',
              overview: '',
              popularity: 0,
              release_date: '',
              video: false,
              vote_average: 0,
              vote_count: 0
            } as MediaDetails;
          })
      );
      
      const details = await Promise.all(detailsPromises);
      setFavorites(details);
    } catch (err: unknown) {
      console.error('Error loading favorites:', err);
      setError('Impossible de charger vos favoris. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);
  
  const handleRefresh = () => {
    loadFavorites();
  };
  
  const handleRemoveFavorite = (id: number, mediaType: string) => {
    removeFromFavorites(id, mediaType);
    setFavorites(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
    router.refresh();
  };
  
  const totalPages = Math.ceil(favorites.length / ITEMS_PER_PAGE);
  const paginatedFavorites = favorites.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container-default animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Mes favoris</h1>
        <p className="text-gray-600 mb-2">
          Retrouvez ici tous vos films et séries favoris.
        </p>
        <button 
          onClick={handleRefresh}
          className="text-accent hover:underline text-sm flex items-center"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Actualiser
        </button>
      </header>

      {isLoading ? (
        <div className="my-20 flex justify-center">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState 
          title="Aucun favori"
          description="Vous n'avez pas encore ajouté de favoris. Explorez les films et séries et ajoutez-les à vos favoris pour les retrouver ici."
          actionText="Découvrir des films et séries"
          actionLink="/trending"
        />
      ) : (
        <>
          <MediaGrid 
            items={paginatedFavorites.map(item => ({
              ...item,
              media_type: item.media_type
            }))}
            onRemove={handleRemoveFavorite}
          />
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`pagination-btn ${currentPage === page ? 'pagination-btn-active' : ''}`}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
