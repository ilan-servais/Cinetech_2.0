"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '@/types/tmdb';
import { useSession } from 'next-auth/react';
import { isMediaWatched, isMediaInWatchLater, isMediaInFavorites } from '@/lib/dbServices';
import { CheckCircle, Clock, Heart } from 'lucide-react';
import { useHasMounted } from '@/lib/clientUtils';

interface MediaCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  mediaType: string;
  overview?: string;
  releaseDate?: string;
  voteAverage?: number;
  showControls?: boolean;
  statusIndicator?: 'watched' | 'watchLater' | null;
}

const MediaCard: React.FC<MediaCardProps> = ({ 
  id, 
  title, 
  posterPath, 
  mediaType,
  overview,
  releaseDate,
  voteAverage,
  showControls = true,
  statusIndicator = null
}) => {
  const [isWatched, setIsWatched] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const hasMounted = useHasMounted();
  const { data: session } = useSession();
  
  const posterUrl = posterPath 
    ? `https://image.tmdb.org/t/p/w500${posterPath}` 
    : '/images/placeholder.jpg';
  
  // Charger les statuts depuis la base de données
  useEffect(() => {
    async function loadStatuses() {
      if (!session?.user?.id) return;
      
      try {
        const userId = parseInt(session.user.id);
        
        const watched = await isMediaWatched(userId, id);
        const watchLater = await isMediaInWatchLater(userId, id);
        const favorite = await isMediaInFavorites(userId, id);
        
        setIsWatched(watched);
        setIsWatchLater(watchLater);
        setIsFavorite(favorite);
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
      }
    }
    
    loadStatuses();
    
    // Mettre à jour lorsque le statut change
    const handleStatusUpdate = () => loadStatuses();
    window.addEventListener('media-status-update', handleStatusUpdate);
    window.addEventListener('favorites-updated', handleStatusUpdate);
    
    return () => {
      window.removeEventListener('media-status-update', handleStatusUpdate);
      window.removeEventListener('favorites-updated', handleStatusUpdate);
    };
  }, [id, session]);
  
  // Si statusIndicator est fourni, il remplace la valeur de l'état
  const displayWatchedStatus = statusIndicator === 'watched' || isWatched;
  const displayWatchLaterStatus = statusIndicator === 'watchLater' || isWatchLater;
  
  return (
    <Link 
      href={`/media/${id}?type=${mediaType}`} 
      className="group relative flex flex-col bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-dark-border">
        <Image 
          src={posterUrl} 
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover w-full h-full"
          priority={false}
        />
        
        {/* Status indicators */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {displayWatchedStatus && (
            <span className="flex items-center justify-center h-7 w-7 bg-status-watched text-white rounded-full">
              <CheckCircle size={16} />
            </span>
          )}
          
          {displayWatchLaterStatus && (
            <span className="flex items-center justify-center h-7 w-7 bg-status-watchlater text-black rounded-full">
              <Clock size={16} />
            </span>
          )}
          
          {isFavorite && (
            <span className="flex items-center justify-center h-7 w-7 bg-primary text-white rounded-full">
              <Heart size={16} fill="currentColor" />
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-md leading-tight truncate">{title}</h3>
        
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
          <span className="capitalize mr-2">{mediaType === 'movie' ? 'Film' : 'Série'}</span>
          {releaseDate && (
            <span className="ml-auto">{new Date(releaseDate).getFullYear()}</span>
          )}
        </div>
        
        {voteAverage && (
          <div className="mt-2 flex items-center">
            <span className="flex items-center text-xs font-medium bg-primary text-white px-1.5 py-0.5 rounded">
              {voteAverage.toFixed(1)}
            </span>
          </div>
        )}
        
        {overview && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{overview}</p>
        )}
      </div>
    </Link>
  );
};

export default MediaCard;
