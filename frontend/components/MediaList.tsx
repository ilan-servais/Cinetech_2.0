"use client";

import React from 'react';
import { useBulkMediaStatus } from '@/hooks/useMediaStatus';
import { MediaItem } from '@/types/tmdb';

interface MediaListProps {
  children: React.ReactNode;
  items?: Array<MediaItem & { media_type?: string }>;
  preloadStatuses?: boolean;
}

/**
 * 🎯 COMPOSANT WRAPPER POUR LES LISTES DE MÉDIAS
 * 
 * Précharge automatiquement les statuts utilisateur pour améliorer les performances.
 * Évite les requêtes multiples en préchargeant tous les statuts d'un coup.
 * 
 * Usage :
 * <MediaList items={movies} preloadStatuses={true}>
 *   {movies.map(movie => <MediaCard key={movie.id} media={movie} />)}
 * </MediaList>
 */
const MediaList: React.FC<MediaListProps> = ({ 
  children, 
  items = [], 
  preloadStatuses = true 
}) => {
  // 🚀 PRÉCHARGEMENT DES STATUTS pour éviter les requêtes multiples
  const preloadItems = items.map(item => ({
    id: item.id,
    media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie')
  }));

  useBulkMediaStatus(preloadItems, preloadStatuses);

  return <>{children}</>;
};

export default MediaList;
