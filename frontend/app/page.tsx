import { Suspense } from 'react';
import { getTrending, getNowPlayingMovies, getAiringTodaySeries } from '@/lib/tmdb';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import HeroSection from '@/components/HeroSection';

export default async function HomePage() {
  // Fetch data in parallel
  const [trending, nowPlaying, airingToday] = await Promise.all([
    getTrending(),
    getNowPlayingMovies(),
    getAiringTodaySeries(),
  ]);

  return (
    <>
      <HeroSection />
      
      <div className="container-default py-8">
        <Suspense fallback={<div>Chargement des tendances...</div>}>
          <HorizontalCarousel 
            title="Tendances aujourd'hui" 
            items={trending} 
            seeAllLink="/trending"
          />
        </Suspense>
        
        <Suspense fallback={<div>Chargement des films...</div>}>
          <HorizontalCarousel 
            title="Sorties cinéma" 
            items={nowPlaying} 
            seeAllLink="/movies/now-playing"
          />
        </Suspense>
        
        <Suspense fallback={<div>Chargement des séries...</div>}>
          <HorizontalCarousel 
            title="Séries du jour" 
            items={airingToday} 
            seeAllLink="/tv/airing-today"
          />
        </Suspense>
      </div>
    </>
  );
}
