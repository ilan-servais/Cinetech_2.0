import React from 'react';
import { 
  getAiringTodayTV, 
  getTVGenres, 
  discoverTVByGenre, 
  fetchWithItemsPerPage, 
  TMDB_MAX_PAGE 
} from '@/lib/tmdb';
import { MediaItem } from '@/types';
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

export default async function AiringTodaySeriesPage({ 
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
    redirect(`/tv/airing-today?${params.toString()}`);
  }
  
  const itemsPerPage = searchParams.items ? parseInt(searchParams.items, 10) : 20;
  const genreId = searchParams.genre ? parseInt(searchParams.genre, 10) : null;
  
  // Récupérer les genres pour le sélecteur
  const genres = await getTVGenres();
  
  // Request more items than needed to compensate for filtering
  const adjustedItemsPerPage = itemsPerPage * 2; // Fetch double to ensure we have enough after filtering
  
  // Récupérer les séries TV soit par genre soit par diffusion aujourd'hui
  let seriesData;
  if (genreId && !isNaN(genreId)) {
    seriesData = await fetchWithItemsPerPage(
      (p) => discoverTVByGenre(genreId, p),
      page,
      adjustedItemsPerPage
    );
  } else {
    // Utiliser une logique similaire à celle de getAiringTodaySeriesFiltered 
    // mais adaptée pour la pagination et les paramètres de la page
    const excludedGenreIds: number[] = [10767, 10763, 10764, 99];
    
    seriesData = await fetchWithItemsPerPage(
      (p) => getAiringTodayTV(p),
      page,
      adjustedItemsPerPage
    );
    
    // Appliquer le filtre pour exclure les talk-shows
    seriesData.results = seriesData.results.filter((show: MediaItem) => {
      if (!show.genre_ids || show.genre_ids.length === 0) return true;
      return !show.genre_ids.some((id: number) => excludedGenreIds.includes(id));
    });
  }
  
  // Appliquer le filtrage permanent et limiter aux résultats demandés
  // Utiliser un filtrage moins strict pour éviter d'avoir trop peu de résultats
  const filteredResults = seriesData.results.slice(0, itemsPerPage);
  
  // Ensure total_pages is capped
  seriesData.total_pages = Math.min(seriesData.total_pages, TMDB_MAX_PAGE);

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
              Diffusion récente
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
          
          {/* Replace custom pagination with standardized component */}
          <Pagination
            currentPage={page}
            totalPages={seriesData.total_pages}
            baseUrl="/tv/airing-today"
            queryParams={genreId ? { genre: genreId.toString(), items: itemsPerPage.toString() } : 
                                  { items: itemsPerPage !== 20 ? itemsPerPage.toString() : undefined }}
          />
        </Suspense>
      </div>
    </div>
  );
}
