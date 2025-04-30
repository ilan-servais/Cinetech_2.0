import React from 'react';
import { getAiringTodaySeries } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic'; // Pour s'assurer d'avoir des données à jour

interface SearchParams {
  page?: string;
}

export default async function AiringTodaySeriesPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const seriesData = await getAiringTodaySeries(page);
  
  return (
    <div className="bg-[#E3F3FF] min-h-screen py-12">
      <div className="container-default animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0D253F]">Séries diffusées aujourd'hui</h1>
          
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <Link 
              href="/series" 
              className="px-4 py-2 bg-primary/10 text-[#0D253F] font-medium rounded-md"
            >
              Populaires
            </Link>
            <Link 
              href="/tv/airing-today" 
              className="px-4 py-2 bg-accent text-primary font-medium rounded-md"
            >
              Diffusées aujourd'hui
            </Link>
            <Link 
              href="/tv/top-rated" 
              className="px-4 py-2 bg-primary/10 text-[#0D253F] font-medium rounded-md"
            >
              Les mieux notées
            </Link>
          </div>
        </header>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des séries...</div>}>
          <div className="media-grid">
            {seriesData.results.map((serie) => (
              <MediaCard key={serie.id} media={{...serie, media_type: 'tv'}} />
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            {page > 1 && (
              <Link
                href={`/tv/airing-today?page=${page - 1}`}
                className="mx-1 px-4 py-2 rounded-md bg-gray-200 text-[#0D253F]"
              >
                &lt; Précédent
              </Link>
            )}
            
            {Array.from({ length: Math.min(5, seriesData.total_pages) }, (_, i) => {
              let pageNumber = page <= 3 
                ? i + 1 
                : page >= seriesData.total_pages - 2 
                  ? seriesData.total_pages - 4 + i 
                  : page - 2 + i;
                
              if (seriesData.total_pages < 5) {
                pageNumber = i + 1;
              }
              
              if (pageNumber < 1 || pageNumber > seriesData.total_pages) return null;
              
              return (
                <Link
                  key={pageNumber}
                  href={`/tv/airing-today?page=${pageNumber}`}
                  className={`mx-1 px-4 py-2 rounded-md ${
                    pageNumber === page 
                      ? 'bg-accent text-textLight font-bold' 
                      : 'bg-gray-200 text-[#0D253F]'
                  }`}
                >
                  {pageNumber}
                </Link>
              );
            })}
            
            {page < seriesData.total_pages && (
              <Link
                href={`/tv/airing-today?page=${page + 1}`}
                className="mx-1 px-4 py-2 rounded-md bg-gray-200 text-[#0D253F]"
              >
                Suivant &gt;
              </Link>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
