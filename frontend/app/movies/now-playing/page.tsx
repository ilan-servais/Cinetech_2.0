import React from 'react';
import { getNowPlayingMovies, getMovieGenres, discoverMoviesByGenre } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';
import { Suspense } from 'react';
import { filterPureCinema } from '@/lib/utils';
import GenreSelector from '@/components/GenreSelector';
import ItemsPerPageSelector from '@/components/ItemsPerPageSelector';
import Pagination from '@/components/Pagination';

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  genre?: string;
  items?: string;
}

export default async function NowPlayingMoviesPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const itemsPerPage = searchParams.items ? parseInt(searchParams.items, 10) : 20; // Default to 20 items per page
  const genreId = searchParams.genre ? parseInt(searchParams.genre, 10) : null;
  
  // Fetch genres for the selector
  const genres = await getMovieGenres();
  
  // Fetch movies either by genre or get now playing movies
  let moviesData = await getNowPlayingMovies(page);
  
  // If genre is selected, get movies by genre and filter for recent releases
  if (genreId) {
    // Use discover with release_date filter to get recently released movies by genre
    const genreMovies = await discoverMoviesByGenre(genreId, page);
    
    // We could filter here by release date to match the "now playing" concept
    // but we'll let the API handle that with appropriate parameters
    moviesData = genreMovies;
  }
  
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
    
    return `/movies/now-playing?${params.toString()}`;
  };

  return (
    <div className="bg-[#E3F3FF] min-h-screen py-12 dark:bg-backgroundDark">
      <div className="container-default animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0D253F] dark:text-white">Sorties cinéma</h1>
          
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <Link 
              href="/movies" 
              className="btn-primary"
            >
              Populaires
            </Link>
            <Link 
              href="/movies/now-playing" 
              className="btn-secondary"
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
              baseUrl="/movies/now-playing"
              currentPage={page}
              itemsPerPage={itemsPerPage}
            />
            
            <ItemsPerPageSelector
              itemsPerPage={itemsPerPage}
              baseUrl="/movies/now-playing"
              queryParams={genreId ? { genre: genreId.toString() } : {}}
              options={[20, 40, 60]}
            />
          </div>
        </header>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des films...</div>}>
          <div className="media-grid">
            {filteredResults.map((movie) => (
              <MediaCard key={movie.id} media={{ ...movie, media_type: 'movie' }} />
            ))}
          </div>
          
          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-300">Aucun film trouvé pour cette sélection</p>
            </div>
          )}
          
          {/* Remplacer la pagination personnalisée par le composant Pagination */}
          <Pagination
            currentPage={page}
            totalPages={moviesData.total_pages}
            baseUrl="/movies/now-playing"
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
