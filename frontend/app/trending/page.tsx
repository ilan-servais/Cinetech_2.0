import React, { Suspense } from 'react';
import { 
  getTrending, 
  getMovieGenres, 
  fetchWithItemsPerPage, 
  TMDB_MAX_PAGE 
} from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
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
  mediaType?: string;
}

export default async function TrendingPage({ 
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
    redirect(`/trending?${params.toString()}`);
  }
  
  const itemsPerPage = searchParams.items ? parseInt(searchParams.items, 10) : 20;
  const genreId = searchParams.genre ? parseInt(searchParams.genre, 10) : null;
  
  // Fetch data for the page
  const trendingData = await getTrending(page);
  
  // Fetch genres for selector
  const genres = await getMovieGenres();
  
  // Ensure total_pages is capped
  trendingData.total_pages = Math.min(trendingData.total_pages, TMDB_MAX_PAGE);
  
  // Apply filtering
  let filteredResults = filterPureCinema(trendingData.results);
  
  // Add media_type filter option for trending page (movies, tv or both)
  const mediaType = searchParams.mediaType as 'movie' | 'tv' | undefined;
  if (mediaType) {
    filteredResults = filteredResults.filter(item => item.media_type === mediaType);
  }
  
  // Apply genre filtering if genre is selected
  if (genreId) {
    filteredResults = filteredResults.filter(item => 
      item.genre_ids && item.genre_ids.includes(genreId)
    );
  }
  
  return (
    <div className="bg-[#E3F3FF] min-h-screen py-12 dark:bg-backgroundDark">
      <div className="container-default animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0D253F] dark:text-white">Tendances</h1>
          
          <div className="flex flex-wrap gap-6 mb-6 justify-between items-center">
            <GenreSelector 
              genres={genres}
              selectedGenreId={genreId}
              baseUrl="/trending"
              currentPage={page}
              itemsPerPage={itemsPerPage}
            />
            
            <ItemsPerPageSelector
              itemsPerPage={itemsPerPage}
              baseUrl="/trending"
              queryParams={genreId ? { genre: genreId.toString() } : {}}
              options={[20, 40, 60]}
            />
          </div>
        </header>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des tendances...</div>}>
          <div className="media-grid">
            {filteredResults.map((item) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
          
          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-300">Aucun contenu trouvé pour cette sélection</p>
            </div>
          )}
          
          <Pagination
            currentPage={page}
            totalPages={trendingData.total_pages}
            baseUrl="/trending"
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
