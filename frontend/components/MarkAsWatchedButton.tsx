"use client";

import React, { useState, useEffect } from 'react';
import { isWatched, toggleWatched } from '@/lib/watchedItems';
import { isWatchLater } from '@/lib/watchLaterItems';
import { useHasMounted } from '@/hooks/useHasMounted';
import { useAuth } from '@/contexts/AuthContext';

interface MarkAsWatchedButtonProps {
  media: {
    id: number;
    media_type: string;
    title?: string;
    name?: string;
    poster_path: string | null;
  };
  className?: string;
  onToggle?: (isWatched: boolean) => void;
}

const MarkAsWatchedButton: React.FC<MarkAsWatchedButtonProps> = ({ media, className = '', onToggle }) => {
  const [watched, setWatched] = useState(false);
  const [watchLater, setWatchLater] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasMounted = useHasMounted();
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    if (hasMounted && isAuthenticated) {
      const checkStatus = async () => {
        const watchedStatus = await isWatched(media.id, media.media_type);
        const watchLaterStatus = await isWatchLater(media.id, media.media_type);
        setWatched(watchedStatus);
        setWatchLater(watchLaterStatus);
      };
      
      checkStatus();
      
      const handleWatchedUpdated = () => {
        checkStatus();
      };
      
      const handleWatchLaterUpdated = () => {
        checkStatus();
      };
      
      window.addEventListener('watched-updated', handleWatchedUpdated);
      window.addEventListener('watch-later-updated', handleWatchLaterUpdated);
      return () => {
        window.removeEventListener('watched-updated', handleWatchedUpdated);
        window.removeEventListener('watch-later-updated', handleWatchLaterUpdated);
      };
    }
  }, [media.id, media.media_type, hasMounted, isAuthenticated]);
    const handleToggleWatched = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasMounted || !isAuthenticated || loading) return;

    const run = async () => {
      setLoading(true);
      try {
        const result: boolean = await toggleWatched(media, media.media_type);
        setWatched(result);

        if (onToggle) {
          onToggle(result);
        }
      } catch (error) {
        console.error("Failed to toggle watched status:", error);
      } finally {
        setLoading(false);
      }
    };
    run();
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>Déjà vu</span>
      </a>
    );
  }
  
  return (
    <button
      onClick={handleToggleWatched}
      className={`btn-secondary flex items-center gap-2 ${watched ? 'bg-[#00C897] text-white' : ''} ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      aria-label={watched ? "Retirer des contenus vus" : "Marquer comme déjà vu"}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Déjà vu</span>
        </span>
      ) : watched ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Vu</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Déjà vu</span>
        </>
      )}
    </button>
  );
};

export default MarkAsWatchedButton;
