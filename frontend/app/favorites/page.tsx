"use client";

import React, { useState, useEffect } from 'react';
import { getFavorites } from '@/lib/favoritesService';
import { getMediaDetails } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';
import { MediaDetails } from '@/types/tmdb';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const favItems = getFavorites();
        
        if (favItems.length === 0) {
          setFavorites([]);
          setIsLoading(false);
          return;
        }
        
        // Récupérer les détails de chaque média favori
        const detailsPromises = favItems.map(fav => 
          getMediaDetails(fav.id, fav.media_type)
            .catch(err => {
              console.error(`Error fetching details for ${fav.media_type} ${fav.id}:`, err);
              // Return a placeholder with minimal data
              return {
                id: fav.id,
                title: fav.title,
                poster_path: fav.poster_path,
                media_type: fav.media_type
              } as MediaDetails;
            })
        );
        
        const mediaDetails = await Promise.all(detailsPromises);
        setFavorites(mediaDetails);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError('Impossible de charger vos favoris. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFavorites();
    
    // Mettre à jour les favoris lorsque l'événement est déclenché
    const handleFavoritesUpdated = () => {
      loadFavorites();
    };
    
    window.addEventListener('favorites-updated', handleFavoritesUpdated);
    
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdated);
    };
  }, []);
  
  // Handler pour rafraîchir la liste
  const handleRefresh = () => {
    setFavorites([]);
    setIsLoading(true);
    const favItems = getFavorites();
    setFavorites(favItems);
    setIsLoading(false);
  };
  
  return (
    <div className="bg-background min-h-screen py-12">
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
            Rafraîchir
          </button>
        </header>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-4">Aucun favori pour le moment</h2>
            <p className="mb-6 text-gray-600">
              Vous n'avez pas encore ajouté de films ou séries à vos favoris.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/movies" className="btn-primary">
                Découvrir des films
              </Link>
              <Link href="/series" className="btn-secondary">
                Explorer les séries
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="media-grid">
              {favorites.map((media) => (
                <MediaCard key={media.id} media={media} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
