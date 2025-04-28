import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '../types/tmdb';

interface HorizontalCarouselProps {
  title: string;
  items: MediaItem[];
}

const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({ title, items }) => {
  const getItemTitle = (item: MediaItem) => {
    return item.title || item.name || 'Sans titre';
  };

  const getImageUrl = (poster_path: string | null) => {
    if (!poster_path) return '/images/placeholder.png';
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W342}${poster_path}`;
  };

  return (
    <div className="my-8">
      <h2 className="text-xl md:text-2xl font-bold mb-4 px-4">{title}</h2>
      
      {items.length === 0 ? (
        <p className="px-4 text-gray-500">Pas de contenu disponible.</p>
      ) : (
        <div className="flex overflow-x-auto gap-4 px-4 pb-6 snap-x snap-mandatory scrollbar-hide">
          {items.map((item) => (
            <Link 
              key={item.id}
              href={`/media/${item.id}`}
              className="flex-none w-36 snap-start hover:scale-105"
            >
              <div className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800">
                <div className="relative h-56 w-36">
                  <Image 
                    src={getImageUrl(item.poster_path)} 
                    alt={getItemTitle(item)}
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{getItemTitle(item)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HorizontalCarousel;
