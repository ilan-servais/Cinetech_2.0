"use client";

import React, { useState, useEffect } from 'react';
import { isWatchLater, toggleWatchLater } from '@/lib/watchLaterItems';
import { isWatched } from '@/lib/watchedItems';
import { useHasMounted } from '@/lib/clientUtils';
import { useAuth } from '@/contexts/AuthContext';

interface WatchLaterButtonProps {
  media: {
    id: number;
    media_type: string;
    title?: string;
    name?: string;
    poster_path: string | null;
  };
  className?: string;
  onToggle?: (isAdded: boolean) => void;
}

const WatchLaterButton: React.FC<WatchLaterButtonProps> = ({ media, className = '', onToggle }) => {
  const [watchLater, setWatchLater] = useState(false);
  const [watched, setWatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasMounted = useHasMounted();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (hasMounted && isAuthenticated) {
      const checkStatus = async () => {
        const watchLaterStatus = await isWatchLater(media.id, media.media_type);
        const watchedStatus = await isWatched(media.id, media.media_type);
        setWatchLater(watchLaterStatus);
        setWatched(watchedStatus);
      };
      
      checkStatus();
      
      const handleWatchLaterUpdated = () => {
        checkStatus();
      };
      
      const handleWatchedUpdated = () => {
        checkStatus();
      };
      
      window.addEventListener('watch-later-updated', handleWatchLaterUpdated);
      window.addEventListener('watched-updated', handleWatchedUpdated);
      return () => {
        window.removeEventListener('watch-later-updated', handleWatchLaterUpdated);
        window.removeEventListener('watched-updated', handleWatchedUpdated);
      };
    }
  }, [media.id, media.media_type, hasMounted, isAuthenticated]);
  
  const handleToggleWatchLater = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasMounted || !isAuthenticated || loading) return;
    
    setLoading(true);
    try {
      const result = await toggleWatchLater(media, media.media_type);
      setWatchLater(result);
      
      // Call the onToggle callback if provided
      if (onToggle) {
        onToggle(result);
      }
    } catch (error) {
      console.error("Failed to toggle watch later status:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!hasMounted) {
    return null;
  }
  
  // Si l'utilisateur n'est pas authentifié, on peut soit masquer le bouton, 
  // soit afficher une version désactivée qui redirige vers la connexion
  if (!isAuthenticated) {
    return (
      <a 
        href="/login" 
        onClick={(e) => e.stopPropagation()}
        className={`btn-secondary flex items-center gap-2 opacity-70 ${className}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>À voir</span>
      </a>
    );
  }
  
  return (
    <button
      onClick={handleToggleWatchLater}
      className={`btn-secondary flex items-center gap-2 ${watchLater ? 'bg-yellow-500 text-white' : ''} ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      aria-label={watchLater ? "Retirer de la liste à voir" : "Ajouter à la liste à voir"}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>À voir</span>
        </span>
      ) : watchLater ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5.414V5a1 1 0 112 0v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 12.586z" clipRule="evenodd" />
          </svg>
          <span>À voir</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>À voir</span>
        </>
      )}
    </button>
  );
};

export default WatchLaterButton;
