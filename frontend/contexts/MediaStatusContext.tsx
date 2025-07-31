"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMediaStatus, StatusType } from '@/lib/userStatusService';

interface MediaStatusContextType {
  checkMediaStatus: (mediaId: number, mediaType: string) => Promise<void>;
  favorite: boolean;
  watched: boolean;
  watchLater: boolean;
  isLoading: boolean;
}

const MediaStatusContext = createContext<MediaStatusContextType | undefined>(undefined);

export const useMediaStatus = () => {
  const context = useContext(MediaStatusContext);
  if (context === undefined) {
    throw new Error('useMediaStatus must be used within a MediaStatusProvider');
  }
  return context;
};

interface MediaStatusProviderProps {
  children: ReactNode;
  mediaId?: number;
  mediaType?: string;
}

export const MediaStatusProvider = ({ children, mediaId, mediaType }: MediaStatusProviderProps) => {
  const [favorite, setFavorite] = useState<boolean>(false);
  const [watched, setWatched] = useState<boolean>(false);
  const [watchLater, setWatchLater] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkMediaStatus = async (id: number, type: string) => {
    if (!id || !type) return;
    
    setIsLoading(true);
    try {
      const status = await getMediaStatus(id, type);
      setFavorite(status.favorite);
      setWatched(status.watched);
      setWatchLater(status.watchLater);
    } catch (error) {
      console.error('Error fetching media status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mediaId && mediaType) {
      checkMediaStatus(mediaId, mediaType);
    }

    const handleStatusUpdated = () => {
      if (mediaId && mediaType) {
        checkMediaStatus(mediaId, mediaType);
      }
    };

    window.addEventListener('favorites-updated', handleStatusUpdated);
    window.addEventListener('watched-updated', handleStatusUpdated);
    window.addEventListener('watch-later-updated', handleStatusUpdated);

    return () => {
      window.removeEventListener('favorites-updated', handleStatusUpdated);
      window.removeEventListener('watched-updated', handleStatusUpdated);
      window.removeEventListener('watch-later-updated', handleStatusUpdated);
    };
  }, [mediaId, mediaType]);

  const value = {
    checkMediaStatus,
    favorite,
    watched,
    watchLater,
    isLoading
  };

  return (
    <MediaStatusContext.Provider value={value}>
      {children}
    </MediaStatusContext.Provider>
  );
};

export default MediaStatusContext;
