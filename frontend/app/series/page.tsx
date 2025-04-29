import React from 'react';
import { getPopularSeries } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';

export default async function SeriesPage() {
  const seriesData = await getPopularSeries();
  
  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container-default animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary dark:text-textLight">Séries populaires</h1>
          
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <Link 
              href="/series" 
              className="px-4 py-2 bg-accent text-primary font-medium rounded-md"
            >
              Populaires
            </Link>
            <Link 
              href="/tv/airing-today" 
              className="px-4 py-2 bg-primary/10 text-primary dark:bg-primary/30 dark:text-textLight font-medium rounded-md"
            >
              Diffusées aujourd'hui
            </Link>
            <Link 
              href="/tv/top-rated" 
              className="px-4 py-2 bg-primary/10 text-primary dark:bg-primary/30 dark:text-textLight font-medium rounded-md"
            >
              Les mieux notées
            </Link>
          </div>
        </header>
        
        <div className="media-grid">
          {seriesData.results.map((serie) => (
            <MediaCard key={serie.id} media={{ ...serie, media_type: 'tv' }} />
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          {Array.from({ length: Math.min(5, seriesData.total_pages) }, (_, i) => (
            <Link
              key={i}
              href={i === 0 ? '/series' : `/series?page=${i + 1}`}
              className={`mx-1 px-4 py-2 rounded-md ${
                i === 0 
                  ? 'bg-accent text-textLight font-bold' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              {i + 1}
            </Link>
          ))}
          {seriesData.total_pages > 5 && (
            <span className="mx-1 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800">...</span>
          )}
        </div>
      </div>
    </div>
  );
}
