"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '@/types/tmdb';
import { getCachedWatchProviders } from '@/lib/tmdb';
import StreamingProviders from './StreamingProviders';
import { isWatched } from '@/lib/watchedItems';
import { useHasMounted, useIsFavorisPage } from '@/lib/clientUtils';

interface MediaCardProps {
  media: MediaItem & { media_type?: string };
  className?: string;
  showWatchedStatus?: boolean;
  priority?: boolean;
  disableWatchedIndicator?: boolean;
}

// Helper function to determine media type with proper type safety
const determineMediaType = (media: MediaItem & { media_type?: string }): 'movie' | 'tv' => {
  if (media.media_type === 'movie' || media.media_type === 'tv') {
    return media.media_type;
  }
  // Fallback detection based on properties
  return media.first_air_date ? 'tv' : 'movie';
};

const MediaCard: React.FC<MediaCardProps> = ({ 
  media, 
  className = '', 
  showWatchedStatus = true, 
  priority = false, 
  disableWatchedIndicator = false 
}) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [providerType, setProviderType] = useState<'flatrate' | 'rent' | 'buy' | null>(null);
  const [isItemWatched, setIsItemWatched] = useState(false);
  
  const hasMounted = useHasMounted();
  const isFavorisPage = useIsFavorisPage();
  
  const title = media.title || media.name || 'Sans titre';
  const mediaType = determineMediaType(media);
  const posterUrl = media.poster_path 
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}` 
    : '/images/placeholder.jpg';
  
  // Check watched status after mounting and only if not on favoris page
  useEffect(() => {
    if (hasMounted && showWatchedStatus && !disableWatchedIndicator && !isFavorisPage) {
      setIsItemWatched(isWatched(media.id, mediaType));
      
      const handleWatchedUpdated = () => {
        setIsItemWatched(isWatched(media.id, mediaType));
      };
      
      window.addEventListener('watched-updated', handleWatchedUpdated);
      return () => {
        window.removeEventListener('watched-updated', handleWatchedUpdated);
      };
    }
  }, [media.id, mediaType, hasMounted, showWatchedStatus, disableWatchedIndicator, isFavorisPage]);
  
  const getReleaseYear = () => {
    const dateString = media.release_date || media.first_air_date;
    if (!dateString) return '';
    try {
      return new Date(dateString).getFullYear();
    } catch (error) {
      return '';
    }
  };
  
  useEffect(() => {
    if (!hasMounted) return;
    
    const fetchProviders = async () => {
      try {
        const safeMediaType = determineMediaType(media);
        const data = await getCachedWatchProviders(media.id, safeMediaType);
        if (data && data.providers) {
          setProviders(data.providers);
          setProviderType(data.type);
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };
    
    fetchProviders();
  }, [media.id, media, hasMounted]);
  
  const releaseYear = getReleaseYear();
  const displayVote = media.vote_average ? Math.round(media.vote_average * 10) / 10 : null;
  const href = `/media/${media.id}?type=${mediaType}`;
  
  // Should display watched dot? Only if:
  // 1. Component has mounted
  // 2. Item is actually watched
  // 3. We're not on the favoris page
  // 4. Watched indicator is not disabled
  // 5. Watched status should be shown
  const shouldDisplayWatchedDot = hasMounted && 
                                 isItemWatched && 
                                 !isFavorisPage && 
                                 !disableWatchedIndicator && 
                                 showWatchedStatus;
  
  return (
    <Link 
      href={href} 
      className={`media-card block h-full bg-white dark:bg-backgroundDark text-textDark dark:text-textLight dark:border-dark-border ${className}`}
      aria-label={`Voir les détails de ${title}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
        {!disableWatchedIndicator && isWatched(media.id, mediaType) && (
          <div 
            className="absolute top-2 left-2 h-3 w-3 rounded-full border border-[#01B4E4] bg-[#00C897] z-10" 
            title="Déjà vu" 
          />
        )}
        <Image
          src={posterUrl}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          loading={priority ? 'eager' : 'lazy'}
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Cpath d='M0 0h40v60H0z' fill='%23e5e7eb'/%3E%3C/svg%3E"
        />
        {displayVote !== null && (
          <div className="absolute bottom-2 left-2 bg-primary text-textLight text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center dark:bg-accent dark:text-primary">
            {displayVote}
          </div>
        )}
        <div className="absolute top-2 right-2">
          {mediaType === 'movie' && (
            <span className="bg-[#0D253F] text-[#01B4E4] text-xs px-2 py-1 rounded-full">Film</span>
          )}
          {mediaType === 'tv' && (
            <span className="bg-[#01B4E4] text-[#0D253F] text-xs px-2 py-1 rounded-full">Série</span>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm truncate dark:text-textLight">{title}</h3>
        <p className="text-secondary dark:text-gray-400">
          {releaseYear || 'Date inconnue'}
        </p>
        {providers.length > 0 && hasMounted && (
          <div className="mt-2">
            <div className="flex items-center gap-1">
              <span className="text-secondary dark:text-gray-400">
                {providerType === 'flatrate' ? 'Stream' : providerType === 'rent' ? 'Location' : 'Achat'}:
              </span>
              <StreamingProviders 
                providers={providers} 
                size="sm" 
                maxDisplay={providerType === 'rent' ? 2 : 3} 
                showRemainingCount={providerType === 'rent'} 
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default MediaCard;
