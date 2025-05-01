import React from 'react';
import { getPopularMovies, getMovieGenres, discoverMoviesByGenre } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';
import { Suspense } from 'react';
import { filterPureCinema } from '@/lib/utils';
import GenreSelector from '@/components/GenreSelector';
import ItemsPerPageSelector from '@/components/ItemsPerPageSelector';
import PaginationButton from '@/components/PaginationButton';

export const dynamic = 'force-dynamic'; // Pour s'assurer d'avoir des données à jour

interface SearchParams {
  page?: string;
  genre?: string;
  items?: string;
}

export default async function MoviesPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const itemsPerPage = searchParams.items ? parseInt(searchParams.items, 10) : 20; // Default to 20 items per page
  const genreId = searchParams.genre ? parseInt(searchParams.genre, 10) : null;
  
  // Fetch genres for the selector
  const genres = await getMovieGenres();
  
  // Fetch movies either by genre or get popular movies
  const moviesData = genreId 
    ? await discoverMoviesByGenre(genreId, page) 
    : await getPopularMovies(page);
  
  // Apply permanent filtering
  const filteredResults = filterPureCinema(moviesData.results);
  
  // Create base URL for pagination
  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.append('page', pageNum.toString());
    
    if (genreId) {
      params.append('genre', genreId.toString());
    }
    
    if (itemsPerPage !== 20) {
      params.append('items', itemsPerPage.toString());
    }
    
    return `/movies?${params.toString()}`;
  };

  return (
    <div className="bg-[#E3F3FF] min-h-screen py-12 dark:bg-backgroundDark">
      <div className="container-default animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0D253F] dark:text-white">Films populaires</h1>
          
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <Link 
              href="/movies" 
              className="btn-secondary"
            >
              Populaires
            </Link>
            <Link 
              href="/movies/now-playing" 
              className="btn-primary"
            >
              Sorties cinéma
            </Link>
            <Link 
              href="/movies/top-rated" 
              className="btn-primary"
            >
              Les mieux notés
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-6 mb-6 justify-between items-center">
            <GenreSelector 
              genres={genres}
              selectedGenreId={genreId}
              baseUrl="/movies"
              currentPage={page}
              itemsPerPage={itemsPerPage}
            />
            
            <ItemsPerPageSelector
              itemsPerPage={itemsPerPage}
              baseUrl="/movies"
              queryParams={genreId ? { genre: genreId.toString() } : {}}
              options={[20, 40, 60]}
            />
          </div>
        </header>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des films...</div>}>
          <div className="media-grid">
            {filteredResults.map((movie) => (
              <MediaCard key={movie.id} media={{...movie, media_type: 'movie'}} />
            ))}
          </div>
          
          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-300">Aucun film trouvé pour cette sélection</p>
            </div>
          )}
          
          <div className="flex justify-center mt-8">
            {page > 1 && (
              <PaginationButton href={createPageUrl(page - 1)}>
                &lt; Précédent
              </PaginationButton>
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
                <PaginationButton
                  key={pageNumber}
                  href={createPageUrl(pageNumber)}
                  isActive={pageNumber === page}
                >
                  {pageNumber}
                </PaginationButton>
              );
            })}
            
            {page < moviesData.total_pages && (
              <PaginationButton href={createPageUrl(page + 1)}>
                Suivant &gt;
              </PaginationButton>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
