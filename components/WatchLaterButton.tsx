"use client";

import React, { useState, useEffect } from 'react';
import { isMediaInWatchLater, toggleWatchLater, isMediaWatched } from '@/lib/dbServices';
import { useHasMounted } from '@/lib/clientUtils';
import { useSession } from 'next-auth/react';
import { MediaItem } from '@/types/tmdb';
import { Clock, Check, Loader2 } from "lucide-react";

interface WatchLaterButtonProps {
  media: MediaItem;
  className?: string;
  onToggle?: (isAdded: boolean) => void;
}

const WatchLaterButton: React.FC<WatchLaterButtonProps> = ({ media, className = '', onToggle }) => {
  const [watchLater, setWatchLater] = useState(false);
  const [watched, setWatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasMounted = useHasMounted();
  const { data: session } = useSession();
  
  useEffect(() => {
    async function checkStatus() {
      if (!hasMounted || !session?.user?.id) return;
      
      try {
        const userId = parseInt(session.user.id);
        const isInWatchLater = await isMediaInWatchLater(userId, media.id);
        const isWatched = await isMediaWatched(userId, media.id);
        
        setWatchLater(isInWatchLater);
        setWatched(isWatched);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    }
    
    checkStatus();
    
    // Écouter les événements de mise à jour
    const handleStatusUpdate = () => checkStatus();
    
    window.addEventListener('media-status-update', handleStatusUpdate);
    return () => {
      window.removeEventListener('media-status-update', handleStatusUpdate);
    };
  }, [media.id, hasMounted, session]);
  
  const handleToggleWatchLater = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasMounted || !session?.user?.id) return;    try {
      setLoading(true);
      const userId = parseInt(session.user.id);
      const result = await toggleWatchLater(userId, media);
      
      if (result.success) {
        setWatchLater(result.action === 'added');
        
        // Si on ajoute à "à voir", il n'est plus dans "déjà vu"
        if (result.action === 'added') {
          setWatched(false);
        }
        
        // Notify other components about the status change
        window.dispatchEvent(new CustomEvent('media-status-update'));
        
        // Call the onToggle callback if provided
        if (onToggle) {
          onToggle(result.action === 'added');
        }
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!hasMounted) {
    return null;
  }
  
  return (
    <button
      onClick={handleToggleWatchLater}
      disabled={loading}
      className={`btn-secondary flex items-center gap-2 ${
        watchLater ? 'bg-status-watchlater hover:bg-status-watchlater/80 text-black' : ''
      } ${className}`}
      aria-label={watchLater ? "Retirer de la liste à voir" : "Ajouter à la liste à voir"}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement...</span>
        </>
      ) : watchLater ? (
        <>
          <Check className="h-5 w-5" />
          <span>À voir</span>
        </>
      ) : (
        <>
          <Clock className="h-5 w-5" />
          <span>À voir</span>
        </>
      )}
    </button>
  );
};

export default WatchLaterButton;
