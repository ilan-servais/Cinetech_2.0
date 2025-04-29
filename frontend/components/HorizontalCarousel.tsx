import React from 'react';
import { MediaItem } from '@/types/tmdb';
import MediaCard from './MediaCard';

interface HorizontalCarouselProps {
  title: string;
  items: MediaItem[];
  seeAllLink?: string;
}

const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({ 
  title, 
  items,
  seeAllLink
}) => {
  if (items.length === 0) {
    return (
      <div className="my-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-500">Pas de contenu disponible.</p>
      </div>
    );
  }
  
  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        {seeAllLink && (
          <a href={seeAllLink} className="text-accent hover:underline text-sm">
            Voir tout
          </a>
        )}
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide">
        {items.map((item) => (
          <div key={item.id} className="flex-none w-36 sm:w-40 md:w-48 snap-start">
            <MediaCard media={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HorizontalCarousel;
