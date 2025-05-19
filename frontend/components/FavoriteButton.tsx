"use client";

import React, { useState, useEffect } from 'react';
import { toggleUserStatus, removeUserStatus, getMediaStatus } from '@/lib/userStatusService';
import { MediaDetails } from '@/types/tmdb';
import { useAuth } from '@/contexts/AuthContext';

interface FavoriteButtonProps {
  media: MediaDetails;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ media, className = '' }) => {
  const [isFav, setIsFav] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getMediaStatus(media.id, media.media_type);
        setIsFav(status.favorite);
      } catch (error) {
        console.error('Erreur lors de la récupération du statut favori :', error);
      }
    };

    if (user?.id) {
      fetchStatus();
    }

    const handleFavoritesUpdated = () => {
      fetchStatus();
    };

    window.addEventListener('favorites-updated', handleFavoritesUpdated);
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdated);
    };
  }, [media.id, media.media_type, user?.id]);

  const handleToggleFavorite = async () => {
    if (!user?.id) return;
    setIsAnimating(true);

    try {
      if (isFav) {
        await removeUserStatus(media.id, media.media_type, 'FAVORITE');
      } else {
        await toggleUserStatus(
          media.id,
          media.media_type,
          'FAVORITE',
          media.title || media.name,
          media.poster_path
        );
      }

      setIsFav(!isFav);
      window.dispatchEvent(new CustomEvent('favorites-updated'));
    } catch (error) {
      console.error('Erreur lors du toggle favoris :', error);
    } finally {
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={`px-4 py-2 ${isFav 
        ? 'bg-primary text-textLight hover:bg-accent hover:text-primary' 
        : 'bg-accent text-primary hover:bg-primary hover:text-textLight'
      } font-bold rounded-md flex items-center ${className} transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
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
