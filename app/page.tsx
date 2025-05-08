"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trending movies
        const moviesResponse = await fetch('https://api.themoviedb.org/3/trending/movie/week?api_key=11117f4c6c8c8a0db7da108e40792fc2');
        const moviesData = await moviesResponse.json();
        
        // Fetch trending TV series
        const seriesResponse = await fetch('https://api.themoviedb.org/3/trending/tv/week?api_key=11117f4c6c8c8a0db7da108e40792fc2');
        const seriesData = await seriesResponse.json();
        
        setTrendingMovies(moviesData.results.slice(0, 10));
        setTrendingSeries(seriesData.results.slice(0, 10));
      } catch (error) {
        console.error('Error fetching trending content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrending();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-8 text-accent">Bienvenue sur Cinetech 2.0</h1>
        <p className="text-lg mb-4">
          Découvrez, notez et commentez vos films et séries préférés. Rejoignez la communauté Cinetech dès maintenant !
        </p>
      </section>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Chargement en cours...</div>
        </div>
      ) : (
        <>
          {/* Trending Movies Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Films Tendances</h2>
              <Link href="/movies" className="text-accent hover:underline">
                Voir tous les films
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {trendingMovies.map((movie: any) => (
                <Link 
                  key={movie.id} 
                  href={`/media/${movie.id}?type=movie`}
                  className="bg-primary/5 dark:bg-primary/20 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative pb-[150%]">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                      <span className="bg-accent/20 text-xs px-2 py-1 rounded-full">
                        {movie.vote_average.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          
          {/* Trending Series Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Séries Tendances</h2>
              <Link href="/series" className="text-accent hover:underline">
                Voir toutes les séries
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {trendingSeries.map((series: any) => (
                <Link 
                  key={series.id} 
                  href={`/media/${series.id}?type=tv`}
                  className="bg-primary/5 dark:bg-primary/20 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative pb-[150%]">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${series.poster_path}`} 
                      alt={series.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{series.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        {new Date(series.first_air_date).getFullYear()}
                      </span>
                      <span className="bg-accent/20 text-xs px-2 py-1 rounded-full">
                        {series.vote_average.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
