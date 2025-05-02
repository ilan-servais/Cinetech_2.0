"use client";

import React, { useState, useEffect } from 'react';
import { isWatched, toggleWatched } from '@/lib/watchedItems';

interface MarkAsWatchedButtonProps {
  media: {
    id: number;
    media_type: string;
    title?: string;
    name?: string;
    poster_path: string | null;
  };
  className?: string;
}

const MarkAsWatchedButton: React.FC<MarkAsWatchedButtonProps> = ({ media, className = '' }) => {
  const [watched, setWatched] = useState(false);
  
  useEffect(() => {
    setWatched(isWatched(media.id, media.media_type));
    
    const handleWatchedUpdated = () => {
      setWatched(isWatched(media.id, media.media_type));
    };
    
    window.addEventListener('watched-updated', handleWatchedUpdated);
    return () => {
      window.removeEventListener('watched-updated', handleWatchedUpdated);
    };
  }, [media.id, media.media_type]);
  
  const handleToggleWatched = () => {
    toggleWatched(media);
    setWatched(!watched);
  };
  
  return (
    <button
      onClick={handleToggleWatched}
      className={`flex items-center gap-1 py-2 px-4 rounded-md transition-colors ${
        watched 
          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100' 
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100'
      } ${className}`}
      aria-label={watched ? "Retirer des contenus vus" : "Marquer comme vu"}
    >
      {watched ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Déjà vu</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span>Marquer comme vu</span>
        </>
      )}
    </button>
  );
};

export default MarkAsWatchedButton;
