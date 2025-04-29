import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '@/types/tmdb';

interface MediaCardProps {
  media: MediaItem;
  className?: string;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, className = '' }) => {
  const title = media.title || media.name || 'Sans titre';
  
  const getImageUrl = (path: string | null) => {
    if (!path) return '/images/placeholder.jpg';
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W342}${path}`;
  };
  
  const getReleaseYear = () => {
    const dateString = media.release_date || media.first_air_date;
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };
  
  const getMediaType = () => {
    if (media.media_type) return media.media_type;
    // Infère le type basé sur les propriétés
    return media.title ? 'movie' : 'tv';
  };
  
  const releaseYear = getReleaseYear();
  const displayVote = media.vote_average ? Math.round(media.vote_average * 10) / 10 : null;
  const mediaType = getMediaType();
  
  return (
    <Link 
      href={`/media/${media.id}?type=${mediaType}`} 
      className={`media-card block ${className}`}
      aria-label={`Voir les détails de ${title}`}
    >
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={getImageUrl(media.poster_path)}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
          className="object-cover"
        />
        {displayVote !== null && (
          <div className="absolute bottom-2 left-2 bg-primary text-textLight text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center">
            {displayVote}
          </div>
        )}
        <div className="absolute top-2 right-2">
          {mediaType === 'movie' && (
            <span className="bg-primary text-textLight text-xs px-2 py-1 rounded-full">Film</span>
          )}
          {mediaType === 'tv' && (
            <span className="bg-accent text-primary text-xs px-2 py-1 rounded-full">Série</span>
          )}
        </div>
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-bold text-sm truncate">{title}</h3>
        {releaseYear && (
          <p className="text-gray-600 text-xs">{releaseYear}</p>
        )}
      </div>
    </Link>
  );
};

export default MediaCard;
