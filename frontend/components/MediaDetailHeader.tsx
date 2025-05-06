"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MediaItem } from '@/types/tmdb';
import { getCachedWatchProviders } from '@/lib/tmdb';
import StreamingProviders from './StreamingProviders';
import MarkAsWatchedButton from './MarkAsWatchedButton';
import TMDBImage from './TMDBImage';

// Renommons l'interface et le composant pour éviter la confusion
interface MediaHeaderProps {
  media: MediaItem;
  className?: string;
}

const MediaHeader: React.FC<MediaHeaderProps> = ({ media, className = '' }) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [providerType, setProviderType] = useState<'flatrate' | 'rent' | 'buy' | null>(null);
  const title = media.title || media.name || 'Sans titre';
  
  // Nous utiliserons désormais le composant TMDBImage qui gère automatiquement les URLs et fallbacks
  
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
  
  // Nous n'ajoutons pas directement le StatusDot ici car il est déjà géré par le composant parent
  // dans certaines pages comme la page des favoris
  
  return (
    <Link 
      href={href} 
      className={`media-card block h-full bg-white dark:bg-backgroundDark text-textDark dark:text-textLight dark:border-dark-border ${className}`}
      aria-label={`Voir les détails de ${title}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
        <TMDBImage
          path={media.poster_path}
          type="poster"
          size="w500"
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
          className="object-cover"
          loading="lazy"
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
            <StreamingProviders 
              providers={providers.slice(0, 3)} 
              size="sm" 
            />
          </div>
        )}
      </div>
    </Link>
  );
};

export default MediaHeader;