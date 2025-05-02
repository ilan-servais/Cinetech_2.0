import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getTrending, getNowPlayingMovies, getAiringTodaySeries, getTopRatedMovies, fetchPopular } from '@/lib/tmdb';
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
    return !item.genre_ids.some(id => EXCLUDED_CAROUSEL_GENRE_IDS.includes(id));
  });
  
  // Ensuite limiter au nombre souhaité
  return filteredItems.slice(0, limit);
}

export default async function HomePage() {
  // Fetch data in parallel
  const [trendingData, nowPlayingData, airingTodayData, topRatedData] = await Promise.all([
    getTrending(),
    getNowPlayingMovies(),
    getAiringTodaySeries(),
    getTopRatedMovies(),
  ]);

  // Apply permanent filtering to all content
  const trending = filterPureCinema(trendingData.results);
  const nowPlaying = filterPureCinema(nowPlayingData.results);
  const airingToday = filterPureCinema(airingTodayData.results);
  const topRated = filterPureCinema(topRatedData.results);

  // Get popular movies and TV shows as fallbacks
  const popularMoviesData = await fetchPopular('movie');
  const popularTVData = await fetchPopular('tv');
  
  // Extract trending movies and TV shows
  const trendingMovies = trending.filter(item => isMovie(item));
  const trendingTV = trending.filter(item => isTVShow(item));
  
  // Combine and filter results - fix by accessing the results property
  const allMovies = [...trendingMovies, ...popularMoviesData.results]
    .filter(item => isMovie(item))
    .slice(0, 10);
  
  // Appliquer le filtrage amélioré à tous les carrousels
  const trendingFiltered = filterAndLimitResults(trending, 10);
  const nowPlayingFiltered = filterAndLimitResults(nowPlaying, 10);
  const airingTodayFiltered = filterAndLimitResults(airingToday, 10);
  const topRatedFiltered = filterAndLimitResults(topRated, 10);
  
  // Si après filtrage nous avons moins de 10 items, compléter avec des résultats de popularMoviesData/popularTVData
  // Spécifiquement pour les séries TV, filtrer avant de limiter à 10
  let allTVShows = [...trendingTV, ...popularTVData.results].filter(item => isTVShow(item));
  // Filtrer les talk shows de cette liste en premier
  allTVShows = allTVShows.filter(item => !item.genre_ids || !item.genre_ids.some(id => EXCLUDED_CAROUSEL_GENRE_IDS.includes(id)));
  
  // S'assurer d'avoir au maximum 10 séries TV valides après le filtrage
  const validTVShows = allTVShows.slice(0, 10);

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
          <HorizontalCarousel 
            title="Séries du jour" 
            items={validTVShows} 
            seeAllLink="/tv/airing-today"
          />
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
