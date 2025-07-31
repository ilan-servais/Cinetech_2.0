"use client";

import React, { useState, useEffect } from 'react';
import { useHasMounted } from '@/lib/clientUtils';
import { useAuth } from '@/contexts/AuthContext';
import { toggleUserStatus, getMediaStatus } from '@/lib/userStatusService';

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
  const [isWatched, setIsWatched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasMounted = useHasMounted();
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    let isComponentMounted = true;
    
    if (hasMounted && isAuthenticated && user?.id) {
      const fetchStatus = async () => {
        try {
          const componentId = Math.random().toString(36).substring(2, 6);
          console.log(`[MarkAsWatchedButton:${componentId}] 🔍 Fetching status for media ${media.id} (${media.media_type})`);
          
          const status = await getMediaStatus(media.id, media.media_type);
          
          if (!isComponentMounted) return;
          
          console.log(`[MarkAsWatchedButton:${componentId}] 📊 Status received:`, status);
          console.log(`[MarkAsWatchedButton:${componentId}] 🔄 Setting watched state from ${isWatched} to ${status.watched}`);
          setIsWatched(status.watched);
        } catch (error) {
          console.error('Erreur lors de la récupération du statut vu :', error);
        }
      };
      
      fetchStatus();
      
      const handleStatusUpdated = (event: Event) => {
        const eventName = event.type;
        console.log(`[MarkAsWatchedButton] 📣 Status update event received: ${eventName} for media ${media.id}`);
        fetchStatus();
      };
      
      window.addEventListener('watched-updated', handleStatusUpdated);
      window.addEventListener('favorites-updated', handleStatusUpdated);
      window.addEventListener('watch-later-updated', handleStatusUpdated);
      
      return () => {
        isComponentMounted = false;
        window.removeEventListener('watched-updated', handleStatusUpdated);
        window.removeEventListener('favorites-updated', handleStatusUpdated);
        window.removeEventListener('watch-later-updated', handleStatusUpdated);
      };
    }
  }, [media.id, media.media_type, hasMounted, isAuthenticated, user?.id, isWatched]);
  
  const handleToggleWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasMounted || !isAuthenticated || !user?.id || isLoading) return;

    console.log(`MarkAsWatchedButton: Toggling WATCHED status for ${media.id} (${media.media_type}), current status: ${isWatched}`);
    setIsLoading(true);
    
    // Mise à jour optimiste de l'état local
    const newState = !isWatched;
    setIsWatched(newState);
    
    try {
      console.log(`MarkAsWatchedButton: Calling toggleUserStatus API with newState=${newState}`);
      
      // Appel direct à toggleUserStatus sans passer par un service intermédiaire
      const result = await toggleUserStatus(
        media.id,
        media.media_type,
        'WATCHED',
        media.title || media.name,
        media.poster_path
      );
      
      console.log(`MarkAsWatchedButton: API response for toggle WATCHED: ${result}`);
      
      // Si le résultat API diffère de notre prédiction optimiste, corriger l'état
      if (result !== newState) {
        console.log(`MarkAsWatchedButton: API returned different state (${result}) than expected (${newState}), correcting...`);
        setIsWatched(result);
      }

      if (onToggle) {
        onToggle(result);
      }
    } catch (error) {
      console.error("Failed to toggle watched status:", error);
      // En cas d'erreur, restaurer l'état précédent
      setIsWatched(!newState);
    } finally {
      setIsLoading(false);
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
      className={`btn-secondary flex items-center gap-2 ${isWatched ? 'bg-[#00C897] text-white' : ''} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      aria-label={isWatched ? "Retirer des contenus vus" : "Marquer comme déjà vu"}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Déjà vu</span>
        </span>
      ) : isWatched ? (
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
