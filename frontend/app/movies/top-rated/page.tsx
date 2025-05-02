import React from 'react';
import { getTopRatedMovies, getMovieGenres, discoverMoviesByGenre, fetchWithItemsPerPage, TMDB_MAX_PAGE } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';
import { Suspense } from 'react';
import { filterPureCinema } from '@/lib/utils';
import GenreSelector from '@/components/GenreSelector';
import ItemsPerPageSelector from '@/components/ItemsPerPageSelector';
import Pagination from '@/components/Pagination';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'; // Pour s'assurer d'avoir des données à jour

interface SearchParams {
  page?: string;
  genre?: string;
  items?: string;
}

export default async function TopRatedMoviesPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const pageParam = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const page = Math.min(isNaN(pageParam) ? 1 : pageParam, TMDB_MAX_PAGE);
  
  // Redirect if page is beyond the limit
  if (pageParam > TMDB_MAX_PAGE) {
    const params = new URLSearchParams();
    params.set('page', TMDB_MAX_PAGE.toString());
    if (searchParams.genre) params.set('genre', searchParams.genre);
    if (searchParams.items) params.set('items', searchParams.items);
    redirect(`/movies/top-rated?${params.toString()}`);
  }
  
  const itemsPerPage = searchParams.items ? parseInt(searchParams.items, 10) : 20; 
  const genreId = searchParams.genre ? parseInt(searchParams.genre, 10) : null;
  
  // Fetch genres for the selector
  const genres = await getMovieGenres();
  
  // Fetch movies either by genre or get top rated movies
  let moviesData;
  if (genreId) {
    // Utiliser fetchWithItemsPerPage avec un callback
    moviesData = await fetchWithItemsPerPage(
      (p) => discoverMoviesByGenre(genreId, p),
      page,
      itemsPerPage
    );
    
    // Sort by vote_average to mimic top rated but filtered by genre
    moviesData.results.sort((a, b) => b.vote_average - a.vote_average);
  } else {
    moviesData = await getTopRatedMovies(page);
  }
  
  // Ensure total_pages is capped
  moviesData.total_pages = Math.min(moviesData.total_pages, TMDB_MAX_PAGE);
  
  // Apply permanent filtering
  const filteredResults = filterPureCinema(moviesData.results);

  return (
    <div className="bg-[#E3F3FF] min-h-screen py-12 dark:bg-backgroundDark">
      <div className="container-default animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0D253F] dark:text-white">Films les mieux notés</h1>
          
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <Link 
              href="/movies" 
              className="btn-primary"
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
              className="btn-secondary"
            >
              Les mieux notés
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-6 mb-6 justify-between items-center">
            <GenreSelector 
              genres={genres}
              selectedGenreId={genreId}
              baseUrl="/movies/top-rated"
              currentPage={page}
              itemsPerPage={itemsPerPage}
            />
            
            <ItemsPerPageSelector
              itemsPerPage={itemsPerPage}
              baseUrl="/movies/top-rated"
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
          
          <Pagination
            currentPage={page}
            totalPages={moviesData.total_pages}
            baseUrl="/movies/top-rated"
            queryParams={{
              genre: genreId ? genreId.toString() : undefined,
              items: itemsPerPage !== 20 ? itemsPerPage.toString() : undefined
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
