import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { 
  getTrending, 
  getNowPlayingMovies, 
  getAiringTodaySeriesFiltered, 
  getTopRatedMovies, 
  fetchPopular 
} from '@/lib/tmdb';
import { filterPureCinema } from '@/lib/utils';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import { MediaItem, TVShow, isMovie, isTVShow } from '@/types';

// Chargement dynamique du HeroSection qui contient l'image volumineuse
const HeroSection = dynamic(() => import('@/components/HeroSection'), {
  loading: () => <div className="h-screen w-full bg-gradient-to-b from-[#74d0f7] to-[#E3F3FF] flex items-center justify-center">
    <div className="text-center">
      <div className="spinner mx-auto mb-4"></div>
      <h1 className="text-3xl font-bold">Chargement...</h1>
    </div>
  </div>,
  ssr: true // On garde le SSR pour le SEO mais on lazy-load le composant
});

export const metadata = {
  title: 'Cinetech 2.0 - Accueil',
  description: 'Découvrez les derniers films et séries populaires sur Cinetech 2.0'
};

// Constante pour les IDs de genre à exclure des carrousels
const EXCLUDED_CAROUSEL_GENRE_IDS = [10767, 10763, 10764, 99]; // Talk shows, News, Reality, Documentary

// Fonction améliorée pour filtrer correctement les séries avant de limiter les résultats
function filterAndLimitResults(items: MediaItem[], limit = 10) {
  if (!Array.isArray(items)) return [];
  
  // Filtrer d'abord les éléments avec des genres exclus
  const filteredItems = items.filter(item => {
    if (!item.genre_ids || item.genre_ids.length === 0) return true;
    return !item.genre_ids.some((id: number) => EXCLUDED_CAROUSEL_GENRE_IDS.includes(id));
  });
  
  // Ensuite limiter au nombre souhaité
  return filteredItems.slice(0, limit);
}

export default async function HomePage() {
  // Fetch data in parallel
  const [trendingData, nowPlayingData, topRatedData, popularTVData] = await Promise.all([
    getTrending(),
    getNowPlayingMovies(),
    getTopRatedMovies(),
    fetchPopular('tv'),
  ]);

  // Apply permanent filtering to all content
  const trending = filterPureCinema(trendingData.results);
  const nowPlaying = filterPureCinema(nowPlayingData.results);
  const topRated = filterPureCinema(topRatedData.results);

  // Extract trending movies and TV shows
  const trendingMovies = trending.filter(item => isMovie(item));
  const trendingTV = trending.filter(item => isTVShow(item));
  
  // Use the new function to get filtered airing today series
  const airingTodayData = await getAiringTodaySeriesFiltered(10, 5);
  const airingToday = airingTodayData.results;
  
  // Appliquer le filtrage amélioré à tous les carrousels
  const trendingFiltered = filterAndLimitResults(trending, 10);
  const nowPlayingFiltered = filterAndLimitResults(nowPlaying, 10);
  const topRatedFiltered = filterAndLimitResults(topRated, 10);
  
  // Si après filtrage nous avons moins de 10 séries TV pour "Séries du jour",
  // compléter avec des résultats de trendingTV et popularTVData
  let validTVShows: MediaItem[] = [...airingToday];
  
  // Si on n'a pas assez de séries diffusées aujourd'hui, compléter avec des séries en tendance et populaires
  if (validTVShows.length < 10) {
    const additionalShows = [...trendingTV, ...popularTVData.results]
      .filter(item => {
        // Éviter les doublons avec les séries déjà présentes
        return !validTVShows.some(show => show.id === item.id) &&
          // Filtrer les talk-shows et autres genres non désirés
          (!item.genre_ids || !item.genre_ids.some(id => EXCLUDED_CAROUSEL_GENRE_IDS.includes(id)));
      });
    
    validTVShows = [...validTVShows, ...additionalShows].slice(0, 10);
  }

  return (
    <>
      <HeroSection />
      
      <div className="container-default py-8">
        <Suspense fallback={<HorizontalCarousel title="Tendances du jour" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Tendances du jour" 
            items={trendingFiltered} 
            seeAllLink="/trending"
          />
        </Suspense>
        
        <Suspense fallback={<HorizontalCarousel title="Films du jour" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Films du jour" 
            items={nowPlayingFiltered} 
            seeAllLink="/movies/now-playing"
          />
        </Suspense>
        
        <Suspense fallback={<HorizontalCarousel title="Séries du jour" items={[]} isLoading={true} />}>
          {validTVShows.length > 0 ? (
            <HorizontalCarousel 
              title="Séries du jour" 
              items={validTVShows} 
              seeAllLink="/tv/airing-today"
            />
          ) : (
            <div className="my-8">
              <h2 className="text-2xl font-bold mb-4">Séries du jour</h2>
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  Aucune série trouvée pour aujourd'hui.
                </p>
              </div>
            </div>
          )}
        </Suspense>

        <Suspense fallback={<HorizontalCarousel title="Films les mieux notés" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Films les mieux notés" 
            items={topRatedFiltered} 
            seeAllLink="/movies/top-rated"
          />
        </Suspense>
      </div>
    </>
  );
}
