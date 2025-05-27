"use client";

import React, { useState, useEffect } from 'react';
import { getMediaStatus, toggleUserStatus } from '@/lib/userStatusService';
import { MediaDetails } from '@/types/tmdb';
import { useAuth } from '@/contexts/AuthContext';

interface FavoriteButtonProps {
  media: MediaDetails;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ media, className = '' }) => {
  const [isFav, setIsFav] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!user?.id) return;
        
        const status = await getMediaStatus(media.id, mediaType);
        setIsFav(status.favorite);
      } catch (error) {
        console.error('Erreur lors de la récupération du statut favori :', error);
      }
    };

    fetchStatus();

    const handleFavoritesUpdated = fetchStatus;
    window.addEventListener('favorites-updated', handleFavoritesUpdated);
    
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdated);
    };
  }, [media.id, mediaType, user?.id]);

  const handleToggleFavorite = async () => {
    if (!user?.id) return;
    
    setIsAnimating(true);
    setIsLoading(true);

    try {
      const result = await toggleUserStatus(
        media.id,
        mediaType,
        'FAVORITE',
        media.title || media.name,
        media.poster_path
      );
      
      // Update state based on API response
      setIsFav(result);
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`px-4 py-2 ${isFav 
        ? 'bg-primary text-textLight hover:bg-accent hover:text-primary' 
        : 'bg-accent text-primary hover:bg-primary hover:text-textLight'
      } font-bold rounded-md flex items-center ${className} transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
      aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <span className={`mr-2 ${isAnimating ? 'animate-ping' : ''}`}>
        {isFav ? "★" : "☆"}
      </span>
      <span>{isFav ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
    </button>
  );
};

export default FavoriteButton;
