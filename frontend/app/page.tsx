import { Suspense } from 'react';
import { getTrending, getNowPlayingMovies, getAiringTodaySeries, getTopRatedMovies } from '@/lib/tmdb';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import HeroSection from '@/components/HeroSection';

export default async function HomePage() {
  // Fetch data in parallel
  const [trending, nowPlaying, airingToday, topRated] = await Promise.all([
    getTrending(),
    getNowPlayingMovies(),
    getAiringTodaySeries(),
    getTopRatedMovies(),
  ]);

  return (
    <>
      <HeroSection />
      
      <div className="container-default py-8">
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des tendances...</div>}>
          <HorizontalCarousel 
            title="Tendances aujourd'hui" 
            items={trending.results} 
            seeAllLink="/trending"
          />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des films...</div>}>
          <HorizontalCarousel 
            title="Sorties cinéma" 
            items={nowPlaying.results} 
            seeAllLink="/movies/now-playing"
          />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des séries...</div>}>
          <HorizontalCarousel 
            title="Séries du jour" 
            items={airingToday.results} 
            seeAllLink="/tv/airing-today"
          />
        </Suspense>

        <Suspense fallback={<div className="h-64 flex items-center justify-center">Chargement des films populaires...</div>}>
          <HorizontalCarousel 
            title="Films les mieux notés" 
            items={topRated.results} 
            seeAllLink="/movies/top-rated"
          />
        </Suspense>
      </div>
    </>
  );
}
