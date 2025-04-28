import { Suspense } from 'react';
import { getTrending, getNowPlayingMovies, getAiringTodaySeries } from '@/lib/tmdb';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import { MediaItem } from '@/types/tmdb';

async function HomePage() {
  // Fetch data in parallel
  const [trending, nowPlaying, airingToday] = await Promise.all([
    getTrending(),
    getNowPlayingMovies(),
    getAiringTodaySeries(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 px-4">Bienvenue sur Cinetech 2.0</h1>
        
        <Suspense fallback={<div className="px-4">Chargement des tendances...</div>}>
          <HorizontalCarousel title="Tendances aujourd'hui" items={trending} />
        </Suspense>
        
        <Suspense fallback={<div className="px-4">Chargement des films...</div>}>
          <HorizontalCarousel title="Sorties cinéma" items={nowPlaying} />
        </Suspense>
        
        <Suspense fallback={<div className="px-4">Chargement des séries...</div>}>
          <HorizontalCarousel title="Séries du jour" items={airingToday} />
        </Suspense>
      </main>
    </div>
  );
}

export default HomePage;
