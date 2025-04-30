import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getTrending, getNowPlayingMovies, getAiringTodaySeries, getTopRatedMovies } from '@/lib/tmdb';
import HorizontalCarousel from '@/components/HorizontalCarousel';

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
            items={trending.results.slice(0, 10)} 
            seeAllLink="/trending"
          />
        </Suspense>
        
        <Suspense fallback={<HorizontalCarousel title="Sorties cinéma" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Sorties cinéma" 
            items={nowPlaying.results.slice(0, 10)} 
            seeAllLink="/movies/now-playing"
          />
        </Suspense>
        
        <Suspense fallback={<HorizontalCarousel title="Séries du jour" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Séries du jour" 
            items={airingToday.results.slice(0, 10)} 
            seeAllLink="/tv/airing-today"
          />
        </Suspense>

        <Suspense fallback={<HorizontalCarousel title="Films les mieux notés" items={[]} isLoading={true} />}>
          <HorizontalCarousel 
            title="Films les mieux notés" 
            items={topRated.results.slice(0, 10)} 
            seeAllLink="/movies/top-rated"
          />
        </Suspense>
      </div>
    </>
  );
}
