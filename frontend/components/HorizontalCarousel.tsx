"use client";

import React, { useState } from 'react';
import { MediaItem } from '@/types/tmdb';
import MediaCard from './MediaCard';
import MediaCardSkeleton from './MediaCardSkeleton';
import Link from 'next/link';

interface HorizontalCarouselProps {
  title: string;
  items: MediaItem[];
  seeAllLink?: string;
  isLoading?: boolean;
}

const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({ 
  title, 
  items,
  seeAllLink,
  isLoading = false
}) => {
  const [hasScrolled, setHasScrolled] = useState(false);

  if (isLoading) {
    return (
      <section className="my-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {seeAllLink && (
            <div className="w-20 h-6 bg-gray-300 rounded"></div>
          )}
        </div>
        
        <div className="relative group">
          <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            {Array(6).fill(0).map((_, index) => (
              <div 
                key={index} 
                className="flex-none w-36 sm:w-40 md:w-48 snap-start"
              >
                <MediaCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="my-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-500">Pas de contenu disponible.</p>
      </div>
    );
  }
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasScrolled && e.currentTarget.scrollLeft > 0) {
      setHasScrolled(true);
    }
  };
  
  return (
    <section className="my-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        {seeAllLink && (
          <Link href={seeAllLink} className="text-accent hover:underline text-sm flex items-center">
            Voir tout
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
      </div>
      
      <div className="relative group">
        <div 
          className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
          onScroll={handleScroll}
        >
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
        
        {items.length > 4 && (
          <>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block">
              <div className={`bg-primary/50 text-white p-1 rounded-full cursor-pointer ${hasScrolled ? 'opacity-70 hover:opacity-100' : 'opacity-30'} transition-opacity`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
              <div className="bg-primary/50 text-white p-1 rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HorizontalCarousel;
