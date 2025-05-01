import React from 'react';
import { getAiringTodaySeries, getTVGenres, discoverTVByGenre, fetchWithItemsPerPage } from '@/lib/tmdb';
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

export default async function AiringTodaySeriesPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const itemsPerPage = searchParams.items ? parseInt(searchParams.items, 10) : 20;
  const genreId = searchParams.genre ? parseInt(searchParams.genre, 10) : null;
  
  // Récupérer les genres pour le sélecteur
  const genres = await getTVGenres();
  
  // Request more items than needed to compensate for filtering
  const adjustedItemsPerPage = itemsPerPage * 2; // Fetch double to ensure we have enough after filtering
  
  // Récupérer les séries TV soit par genre soit par diffusion aujourd'hui
  let seriesData;
  if (genreId) {
    seriesData = await fetchWithItemsPerPage(
      (p) => discoverTVByGenre(genreId, p),
      page,
      adjustedItemsPerPage
    );
  } else {
    seriesData = await fetchWithItemsPerPage(
      getAiringTodaySeries,
      page,
      adjustedItemsPerPage
    );
  }
  
  // Appliquer le filtrage permanent
  const filteredResults = filterPureCinema(seriesData.results).slice(0, itemsPerPage);
  
  // Créer l'URL de base pour la pagination
  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.append('page', pageNum.toString());
    
    if (genreId) {
      params.append('genre', genreId.toString());
    }
    
    if (itemsPerPage !== 20) {
      params.append('items', itemsPerPage.toString());
    }
    
    return `/tv/airing-today?${params.toString()}`;
  };

  return (
    <div className="bg-[#E3F3FF] min-h-screen py-12 dark:bg-backgroundDark">
      <div className="container-default animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0D253F] dark:text-white">Séries diffusées aujourd'hui</h1>
          
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <Link 
              href="/series" 
              className="btn-primary"
            >
              Populaires
            </Link>
            <Link 
              href="/tv/airing-today" 
              className="btn-secondary"
            >
              Diffusées aujourd'hui
            </Link>
            <Link 
              href="/tv/top-rated" 
              className="btn-primary"
            >
              Les mieux notées
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-6 mb-6 justify-between items-center">
            <GenreSelector 
              genres={genres}
              selectedGenreId={genreId}
              baseUrl="/tv/airing-today"
              currentPage={page}
              itemsPerPage={itemsPerPage}
            />
            
            <ItemsPerPageSelector
              itemsPerPage={itemsPerPage}
              baseUrl="/tv/airing-today"
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
          
          {/* Display filtering information for debugging */}
          <div className="text-center text-sm text-gray-500 mt-4">
            {`${filteredResults.length} séries affichées`}
          </div>
          
          <div className="flex justify-center mt-8">
            {page > 1 && (
              <PaginationButton href={createPageUrl(page - 1)}>
                &lt; Précédent
              </PaginationButton>
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
                <PaginationButton
                  key={pageNumber}
                  href={createPageUrl(pageNumber)}
                  isActive={pageNumber === page}
                >
                  {pageNumber}
                </PaginationButton>
              );
            })}
            
            {page < seriesData.total_pages && (
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
