import React from 'react';
import { MediaItem } from '@/types/tmdb';
import MediaCard from './MediaCard';
import Link from 'next/link';

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
    <section className="my-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        {seeAllLink && (
          <Link href={seeAllLink} className="text-accent hover:underline text-sm flex items-center">
            Voir tout
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
      </div>
      
      <div className="relative group">
        <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="flex-none w-36 sm:w-40 md:w-48 snap-start" 
              style={{ 
                opacity: 0,
                animation: `fadeIn 0.3s ease-in-out forwards ${index * 0.05}s`
              }}
            >
              <MediaCard media={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HorizontalCarousel;
