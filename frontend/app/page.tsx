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

async function filterValidTVShows(shows: MediaItem[], count = 10) {
  // Filter out talk shows, news, documentaries based on genre_ids
  // Common IDs for talk shows, reality TV, news: 10767 (talk), 10764 (reality), 10763 (news)
  const nonRelevantGenreIds = [10767, 10764, 10763];
  
  const validShows = shows.filter(show => {
    if (!isTVShow(show)) return false;
    
    // Check if it has any of the non-relevant genre IDs
    return !show.genre_ids.some(id => nonRelevantGenreIds.includes(id));
  });

  // Return only the required number of shows
  return validShows.slice(0, count);
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
  
  // Get all TV shows and get more results if needed to reach 10 valid shows
  let allTVShows = [...trendingTV, ...popularTVData.results].filter(item => isTVShow(item));
  const validTVShows = await filterValidTVShows(allTVShows, 10);
  
  return (
    <>
      <HeroSection />
      
      <div className="container-default py-8">
        <Suspense fallback={<HorizontalCarousel title="Tendances du jour" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Tendances du jour" 
            items={trending.slice(0, 10)} 
            seeAllLink="/trending"
          />
        </Suspense>
        
        <Suspense fallback={<HorizontalCarousel title="Films du jour" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Films du jour" 
            items={nowPlaying.slice(0, 10)} 
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
            items={topRated.slice(0, 10)} 
            seeAllLink="/movies/top-rated"
          />
        </Suspense>
      </div>
    </>
  );
}
