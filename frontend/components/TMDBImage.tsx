"use client";

import Image from 'next/image';
import { useState } from 'react';
import type { ImageProps } from 'next/image';

type ImageType = 'poster' | 'backdrop' | 'profile' | 'logo' | 'still';
type ImageSize = 'original' | 'w92' | 'w154' | 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'h632';

interface TMDBImageProps extends Omit<ImageProps, 'src'> {
  path: string | null;
  type?: ImageType;
  size?: ImageSize;
  fallbackSrc?: string;
}

/**
 * Composant réutilisable pour afficher des images de l'API TMDB
 * Gère les images manquantes avec des fallbacks et utilise les variables d'environnement
 */
const TMDBImage: React.FC<TMDBImageProps> = ({
  path,
  type = 'poster',
  size = 'w500',
  fallbackSrc,
  alt,
  ...props
}) => {
  const [error, setError] = useState(false);
  
  // Détermine l'image de fallback en fonction du type d'image
  const getDefaultFallback = () => {
    switch (type) {
      case 'poster': return '/images/placeholder.jpg';
      case 'backdrop': return '/images/default-backdrop.webp';
      case 'profile': return '/images/person-placeholder.jpg';
      case 'logo': return '/images/logo-placeholder.png';
      case 'still': return '/images/still-placeholder.jpg';
      default: return '/images/placeholder.jpg';
    }
  };
  
  // URL de base pour les images TMDB selon la taille demandée
  const getBaseUrl = () => {
    // Utiliser la variable d'environnement correspondante ou un fallback
    switch (size) {
      case 'original':
        return process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p/original';
      case 'w185':
        return process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W185 || 'https://image.tmdb.org/t/p/w185';
      case 'w342':
        return process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W342 || 'https://image.tmdb.org/t/p/w342';
      case 'w500':
      default:
        return process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W500 || 'https://image.tmdb.org/t/p/w500';
    }
  };
  
  // Construit l'URL complète de l'image avec fallback sécurisé
  const getSrc = () => {
    // Si une erreur est survenue ou si path est null/undefined, utiliser l'image de fallback
    if (error || !path) {
      return fallbackSrc || getDefaultFallback();
    }
    
    return `${getBaseUrl()}${path}`;
  };
    return (
    <Image
      {...props}
      src={getSrc()}
      alt={alt || 'Image'}
      onError={() => setError(true)}
      placeholder={props.placeholder || "blur"}
      blurDataURL={props.blurDataURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Cpath d='M0 0h40v60H0z' fill='%23e5e7eb'/%3E%3C/svg%3E"}
    />
  );
};

export default TMDBImage;
