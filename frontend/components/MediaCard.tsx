"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '@/types/tmdb';
import { getCachedWatchProviders } from '@/lib/tmdb';
import StreamingProviders from './StreamingProviders';

interface MediaCardProps {
  media: MediaItem;
  className?: string;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, className = '' }) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [providerType, setProviderType] = useState<'flatrate' | 'rent' | 'buy' | null>(null);
  const title = media.title || media.name || 'Sans titre';
  
  // Fonction pour obtenir l'URL de l'image du poster
  const getPosterImage = (path: string | null) => {
    if (!path) return '/images/placeholder.jpg';
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W342}${path}`;
  };
  
  const getReleaseYear = () => {
    const dateString = media.release_date || media.first_air_date;
    if (!dateString) return '';
    try {
      return new Date(dateString).getFullYear();
    } catch (error) {
      return '';
    }
  };
  
  const getMediaType = () => {
    // S'assurer que media_type est explicitement défini et valide
    if (media.media_type && (media.media_type === 'movie' || media.media_type === 'tv')) {
      return media.media_type;
    }
    // Fallback basé sur les propriétés
    return media.title ? 'movie' : 'tv';
  };

  useEffect(() => {
    const fetchProviders = async () => {
      const mediaType = getMediaType();
      try {
        const data = await getCachedWatchProviders(media.id, mediaType);
        if (data && data.providers) {
          setProviders(data.providers);
          setProviderType(data.type);
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };
    
    fetchProviders();
  }, [media.id]);
  
  const releaseYear = getReleaseYear();
  const displayVote = media.vote_average ? Math.round(media.vote_average * 10) / 10 : null;
  const mediaType = getMediaType();
  const href = `/media/${media.id}?type=${mediaType}`;
  
  return (
    <Link 
      href={href} 
      className={`media-card block h-full bg-white dark:bg-backgroundDark text-textDark dark:text-textLight dark:border-dark-border ${className}`}
      aria-label={`Voir les détails de ${title}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
        <Image
          src={getPosterImage(media.poster_path)}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
          className="object-cover"
          loading="lazy"
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
        {providers.length > 0 && (
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
