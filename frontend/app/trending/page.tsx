import React from 'react';
import { getTrending } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic'; // Pour s'assurer d'avoir des données à jour

interface SearchParams {
  page?: string;
}

export default async function TrendingPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const trendingData = await getTrending(page);
  
  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container-default animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Tendances du moment</h1>
          <p className="text-gray-600 mb-6">
            Découvrez les films et séries qui font parler d'eux aujourd'hui
          </p>
          
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <Link 
              href="/movies" 
              className="px-4 py-2 bg-primary/10 text-black font-medium rounded-md"
            >
              Films populaires
            </Link>
            <Link 
              href="/series" 
              className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-md"
            >
              Séries populaires
            </Link>
          </div>
        </header>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des tendances...</div>}>
          <div className="media-grid">
            {trendingData.results.map((item) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            {page > 1 && (
              <Link
                href={page === 2 ? '/trending' : `/trending?page=${page - 1}`}
                className="mx-1 px-4 py-2 rounded-md bg-gray-200 text-gray-700"
              >
                &lt; Précédent
              </Link>
            )}
            
            {Array.from({ length: Math.min(5, trendingData.total_pages) }, (_, i) => {
              let pageNumber = page <= 3 
                ? i + 1 
                : page >= trendingData.total_pages - 2 
                  ? trendingData.total_pages - 4 + i 
                  : page - 2 + i;
                
              if (trendingData.total_pages < 5) {
                pageNumber = i + 1;
              }
              
              if (pageNumber < 1 || pageNumber > trendingData.total_pages) return null;
              
              return (
                <Link
                  key={pageNumber}
                  href={pageNumber === 1 ? '/trending' : `/trending?page=${pageNumber}`}
                  className={`mx-1 px-4 py-2 rounded-md ${
                    pageNumber === page 
                      ? 'bg-accent text-textLight font-bold' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {pageNumber}
                </Link>
              );
            })}
            
            {page < trendingData.total_pages && (
              <Link
                href={`/trending?page=${page + 1}`}
                className="mx-1 px-4 py-2 rounded-md bg-gray-200 text-gray-700"
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
