import React from 'react';
import { getTopRatedSeries, getTVGenres, discoverTVByGenre, TMDB_MAX_PAGE } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';
import { Suspense } from 'react';
import { filterPureCinema } from '@/lib/utils';
import GenreSelector from '@/components/GenreSelector';
import ItemsPerPageSelector from '@/components/ItemsPerPageSelector';
import Pagination from '@/components/Pagination';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  genre?: string;
  items?: string;
}

export default async function TopRatedTVPage({ 
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
    redirect(`/tv/top-rated?${params.toString()}`);
  }
  
  const itemsPerPage = searchParams.items ? parseInt(searchParams.items, 10) : 20;
  const genreId = searchParams.genre ? parseInt(searchParams.genre, 10) : null;
  
  // Fetch genres for selector
  const genres = await getTVGenres();
  
  // Fetch TV shows either by genre or top rated
  let seriesData = await getTopRatedSeries(page);
  
  // If genre is selected, filter top rated by that genre
  if (genreId) {
    const genreShows = await discoverTVByGenre(genreId, page);
    // Sort by vote_average to mimic top rated but filtered by genre
    genreShows.results.sort((a, b) => b.vote_average - a.vote_average);
    seriesData = genreShows;
  }
  
  // Ensure total_pages is capped
  seriesData.total_pages = Math.min(seriesData.total_pages, TMDB_MAX_PAGE);
  
  // Apply permanent filtering
  const filteredResults = filterPureCinema(seriesData.results);
  
  return (
    <div className="bg-[#E3F3FF] min-h-screen py-12 dark:bg-backgroundDark">
      <div className="container-default animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0D253F] dark:text-white">Séries les mieux notées</h1>
          
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <Link 
              href="/series" 
              className="btn-primary"
            >
              Populaires
            </Link>
            <Link 
              href="/tv/airing-today" 
              className="btn-primary"
            >
              Diffusées aujourd'hui
            </Link>
            <Link 
              href="/tv/top-rated" 
              className="btn-secondary"
            >
              Les mieux notées
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-6 mb-6 justify-between items-center">
            <GenreSelector 
              genres={genres}
              selectedGenreId={genreId}
              baseUrl="/tv/top-rated"
              currentPage={page}
              itemsPerPage={itemsPerPage}
            />
            
            <ItemsPerPageSelector
              itemsPerPage={itemsPerPage}
              baseUrl="/tv/top-rated"
              queryParams={genreId ? { genre: genreId.toString() } : {}}
              options={[20, 40, 60]}
            />
          </div>
        </header>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des séries...</div>}>
          <div className="media-grid">
            {filteredResults.map((series) => (
              <MediaCard key={series.id} media={{...series, media_type: 'tv'}} />
            ))}
          </div>
          
          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-300">Aucune série trouvée pour cette sélection</p>
            </div>
          )}
          
          <Pagination
            currentPage={page}
            totalPages={seriesData.total_pages}
            baseUrl="/tv/top-rated"
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
