"use client";

import React, { useState, useEffect } from 'react';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/favoritesService';
import { MediaDetails } from '@/types/tmdb';

interface FavoriteButtonProps {
  media: MediaDetails;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ media, className = '' }) => {
  const [isFav, setIsFav] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setIsFav(isFavorite(media.id));
    
    const handleFavoritesUpdated = () => {
      setIsFav(isFavorite(media.id));
    };
    
    window.addEventListener('favorites-updated', handleFavoritesUpdated);
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdated);
    };
  }, [media.id]);
  
  const handleToggleFavorite = () => {
    setIsAnimating(true);
    
    if (isFav) {
      removeFavorite(media.id);
    } else {
      addFavorite(media);
    }
    
    setIsFav(!isFav);
    
    // Reset animation after it completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
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
