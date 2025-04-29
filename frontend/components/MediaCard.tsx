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
    if (!path) return '/images/placeholder.png';
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W342}${path}`;
  };
  
  const getReleaseYear = () => {
    const dateString = media.release_date || media.first_air_date;
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };
  
  const releaseYear = getReleaseYear();
  const displayVote = media.vote_average ? Math.round(media.vote_average * 10) / 10 : null;
  
  return (
    <Link href={`/media/${media.id}`} className={`media-card block ${className}`}>
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={getImageUrl(media.poster_path)}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
          className="object-cover"
        />
        {displayVote !== null && (
          <div className="absolute bottom-2 left-2 bg-primary text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center">
            {displayVote}
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-bold text-sm truncate">{title}</h3>
        {releaseYear && (
          <p className="text-gray-600 text-xs">{releaseYear}</p>
        )}
      </div>
    </Link>
  );
};

export default MediaCard;
