"use client";

import React, { useState, useEffect } from 'react';
import { isMediaWatched, toggleWatched, ToggleResult, isMediaInWatchLater } from '@/lib/dbServices';
import { useHasMounted } from '@/lib/clientUtils';
import { useSession } from 'next-auth/react';
import { MediaItem } from '@/types/tmdb';
import { Button } from "./ui/Button";
import { CheckCircle, Check, Loader2 } from "lucide-react";

interface MarkAsWatchedButtonProps {
  media: MediaItem;
  className?: string;
  onToggle?: (isWatched: boolean) => void;
}

const MarkAsWatchedButton: React.FC<MarkAsWatchedButtonProps> = ({ media, className = '', onToggle }) => {
  const [watched, setWatched] = useState(false);
  const [watchLater, setWatchLater] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasMounted = useHasMounted();
  const { data: session } = useSession();
  
  useEffect(() => {
    async function checkStatus() {
      if (!hasMounted || !session?.user?.id) return;
      
      try {
        const userId = parseInt(session.user.id);
        const isWatched = await isMediaWatched(userId, media.id);
        const isInWatchLater = await isMediaInWatchLater(userId, media.id);
        
        setWatched(isWatched);
        setWatchLater(isInWatchLater);
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
  
  const handleToggleWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasMounted || !session?.user?.id) return;
    
    try {
      setLoading(true);
      const userId = parseInt(session.user.id);
      const result = await toggleWatched(userId, media);
      
      if (result.success) {
        setWatched(result.action === 'added');
        
        // Si on marque comme vu, on enlève de la liste "à voir"
        if (result.action === 'added') {
          setWatchLater(false);
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
      onClick={handleToggleWatched}
      disabled={loading}
      className={`btn-secondary flex items-center gap-2 ${
        watched ? 'bg-status-watched hover:bg-status-watched/80 text-white' : ''
      } ${className}`}      aria-label={watched ? "Retirer des contenus vus" : "Marquer comme déjà vu"}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement...</span>
        </>
      ) : watched ? (
        <>
          <CheckCircle className="h-5 w-5" />
          <span>Vu</span>
        </>
      ) : (
        <>
          <Check className="h-5 w-5" />
          <span>Déjà vu</span>
        </>
      )}
    </button>
  );
};

export default MarkAsWatchedButton;
