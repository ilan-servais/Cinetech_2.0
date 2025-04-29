import React from 'react';
import { getNowPlayingMovies } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
}

export default async function NowPlayingMoviesPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const moviesData = await getNowPlayingMovies(page);
  
  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container-default animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Films à l'affiche</h1>
          
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <Link 
              href="/movies" 
              className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-md"
            >
              Populaires
            </Link>
            <Link 
              href="/movies/now-playing" 
              className="px-4 py-2 bg-accent text-primary font-medium rounded-md"
            >
              À l'affiche
            </Link>
            <Link 
              href="/movies/top-rated" 
              className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-md"
            >
              Les mieux notés
            </Link>
          </div>
        </header>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des films...</div>}>
          <div className="media-grid">
            {moviesData.results.map((movie) => (
              <MediaCard key={movie.id} media={{ ...movie, media_type: 'movie' }} />
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            {page > 1 && (
              <Link
                href={page === 2 ? '/movies/now-playing' : `/movies/now-playing?page=${page - 1}`}
                className="mx-1 px-4 py-2 rounded-md bg-gray-200 text-gray-700"
              >
                &lt; Précédent
              </Link>
            )}
            
            {Array.from({ length: Math.min(5, moviesData.total_pages) }, (_, i) => {
              let pageNumber = page <= 3 
                ? i + 1 
                : page >= moviesData.total_pages - 2 
                  ? moviesData.total_pages - 4 + i 
                  : page - 2 + i;
                
              if (moviesData.total_pages < 5) {
                pageNumber = i + 1;
              }
              
              if (pageNumber < 1 || pageNumber > moviesData.total_pages) return null;
              
              return (
                <Link
                  key={pageNumber}
                  href={pageNumber === 1 ? '/movies/now-playing' : `/movies/now-playing?page=${pageNumber}`}
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
            
            {page < moviesData.total_pages && (
              <Link
                href={`/movies/now-playing?page=${page + 1}`}
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
