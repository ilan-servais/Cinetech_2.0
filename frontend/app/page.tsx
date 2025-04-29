import { Suspense } from 'react';
import { getTrending, getNowPlayingMovies, getAiringTodaySeries, getTopRatedMovies } from '@/lib/tmdb';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import HeroSection from '@/components/HeroSection';
import Loading from './loading';

export const metadata = {
  title: 'Cinetech 2.0 - Accueil',
  description: 'Découvrez les derniers films et séries populaires sur Cinetech 2.0'
};

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
        <Suspense fallback={<HorizontalCarousel title="Tendances aujourd'hui" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Tendances aujourd'hui" 
            items={trending.results} 
            seeAllLink="/trending"
          />
        </Suspense>
        
        <Suspense fallback={<HorizontalCarousel title="Sorties cinéma" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Sorties cinéma" 
            items={nowPlaying.results} 
            seeAllLink="/movies/now-playing"
          />
        </Suspense>
        
        <Suspense fallback={<HorizontalCarousel title="Séries du jour" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Séries du jour" 
            items={airingToday.results} 
            seeAllLink="/tv/airing-today"
          />
        </Suspense>

        <Suspense fallback={<HorizontalCarousel title="Films les mieux notés" items={[]} isLoading={true} />}>
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
