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
    const result = toggleWatched(media, media.media_type);
    setWatched(result);
  };
  
  return (
    <button
      onClick={handleToggleWatched}
      className={`btn-secondary flex items-center gap-2 ${watched ? 'bg-[#00C897] text-white' : ''} ${className}`}
      aria-label={watched ? "Retirer des contenus vus" : "Déjà vu"}
    >
      {watched ? (
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
}

export default MarkAsWatchedButton;
