"use client";

import React, { useState, useEffect } from 'react';
import { isWatchLater, toggleWatchLater } from '@/lib/watchLaterItems';
import { isWatched } from '@/lib/watchedItems';
import { useHasMounted } from '@/lib/clientUtils';

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
  const hasMounted = useHasMounted();
  
  useEffect(() => {
    if (hasMounted) {
      setWatchLater(isWatchLater(media.id, media.media_type));
      setWatched(isWatched(media.id, media.media_type));
      
      const handleWatchLaterUpdated = () => {
        setWatchLater(isWatchLater(media.id, media.media_type));
      };
      
      const handleWatchedUpdated = () => {
        setWatched(isWatched(media.id, media.media_type));
      };
      
      window.addEventListener('watch-later-updated', handleWatchLaterUpdated);
      window.addEventListener('watched-updated', handleWatchedUpdated);
      return () => {
        window.removeEventListener('watch-later-updated', handleWatchLaterUpdated);
        window.removeEventListener('watched-updated', handleWatchedUpdated);
      };
    }
  }, [media.id, media.media_type, hasMounted]);
  
  const handleToggleWatchLater = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasMounted) return;
    
    const result = toggleWatchLater(media, media.media_type);
    setWatchLater(result);
    
    // If we just added to watch later, make sure we update the watched state as well
    // since toggleWatchLater will remove from watched
    if (result && watched) {
      setWatched(false);
    }
    
    // Call the onToggle callback if provided
    if (onToggle) {
      onToggle(result);
    }
  };
  
  if (!hasMounted) {
    return null;
  }
  
  return (
    <button
      onClick={handleToggleWatchLater}
      className={`btn-secondary flex items-center gap-2 ${watchLater ? 'bg-yellow-500 text-white' : ''} ${className}`}
      aria-label={watchLater ? "Retirer de la liste à voir" : "Ajouter à la liste à voir"}
    >
      {watchLater ? (
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
