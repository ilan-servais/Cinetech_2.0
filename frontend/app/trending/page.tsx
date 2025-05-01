import React from 'react';
import { getTrending, getMovieGenres } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import { Suspense } from 'react';
import { filterPureCinema } from '@/lib/utils';
import GenreSelector from '@/components/GenreSelector';
import ItemsPerPageSelector from '@/components/ItemsPerPageSelector';
import PaginationButton from '@/components/PaginationButton';

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  genre?: string;
  items?: string;
}

export default async function TrendingPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const itemsPerPage = searchParams.items ? parseInt(searchParams.items, 10) : 20;
  const genreId = searchParams.genre ? parseInt(searchParams.genre, 10) : null;
  
  // Fetch genres for selector
  const genres = await getMovieGenres();
  
  // Fetch trending media
  const trendingData = await getTrending(page);
  
  // Apply filtering
  let filteredResults = filterPureCinema(trendingData.results);
  
  // Apply genre filtering if genre is selected
  if (genreId) {
    filteredResults = filteredResults.filter(item => 
      item.genre_ids && item.genre_ids.includes(genreId)
    );
  }
  
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
    
    return `/trending?${params.toString()}`;
  };

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
          
          <div className="flex justify-center mt-8">
            {page > 1 && (
              <PaginationButton href={createPageUrl(page - 1)}>
                &lt; Précédent
              </PaginationButton>
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
                <PaginationButton
                  key={pageNumber}
                  href={createPageUrl(pageNumber)}
                  isActive={pageNumber === page}
                >
                  {pageNumber}
                </PaginationButton>
              );
            })}
            
            {page < trendingData.total_pages && (
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
