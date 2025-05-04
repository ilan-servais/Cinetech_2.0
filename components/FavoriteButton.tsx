"use client";

import React, { useState, useEffect } from 'react';
import { isMediaInFavorites, toggleFavorite } from '@/lib/dbServices';
import { MediaDetails } from '@/types/tmdb';
import { useSession } from 'next-auth/react';
import { useHasMounted } from '@/lib/clientUtils';
import { Heart, Loader2 } from "lucide-react";

interface FavoriteButtonProps {
  media: MediaDetails;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ media, className = '' }) => {
  const [isFav, setIsFav] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasMounted = useHasMounted();
  const { data: session } = useSession();
  
  useEffect(() => {
    async function checkStatus() {
      if (!hasMounted || !session?.user?.id) return;
      
      try {
        const userId = parseInt(session.user.id);
        const isInFavorites = await isMediaInFavorites(userId, media.id);
        setIsFav(isInFavorites);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut des favoris:', error);
      }
    }
    
    checkStatus();
    
    // Écouter les événements de mise à jour
    const handleStatusUpdate = () => checkStatus();
    
    window.addEventListener('favorites-updated', handleStatusUpdate);
    return () => {
      window.removeEventListener('favorites-updated', handleStatusUpdate);
    };
  }, [media.id, hasMounted, session]);
  
  const handleToggleFavorite = async () => {
    if (!hasMounted || !session?.user?.id) return;
    
    setIsAnimating(true);
    setLoading(true);
    
    try {
      const userId = parseInt(session.user.id);
      const result = await toggleFavorite(userId, media);
      
      if (result.success) {
        setIsFav(result.action === 'added');
        // Notify other components about the status change
        window.dispatchEvent(new CustomEvent('favorites-updated'));
      }
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
    } finally {
      setLoading(false);
      // Reset animation after it completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };
    return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`px-4 py-2 ${isFav 
        ? 'bg-primary text-textLight hover:bg-primary/80' 
        : 'bg-primary-lighter text-primary-dark hover:bg-primary-lightest'
      } font-bold rounded-md flex items-center ${className} transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
      aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          <Heart 
            className={`h-5 w-5 mr-2 ${isAnimating ? 'animate-ping' : ''}`} 
            fill={isFav ? "currentColor" : "none"} 
          />
          <span>{isFav ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
        </>
      )}
    </button>
  );
};

export default FavoriteButton;
