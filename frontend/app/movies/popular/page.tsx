"use client";

import React, { useState, useEffect } from 'react';
import { getPopularMovies, TMDB_MAX_PAGE } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MediaItem, Movie, isMovie } from '@/types';
import { MediaItem as TMDBMediaItem } from '@/types/tmdb';

export default function PopularMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const safePage = Math.min(page, TMDB_MAX_PAGE);
    if (page !== safePage) {
      setPage(safePage);
      return;
    }
    
    async function loadMovies() {
      setIsLoading(true);
      try {
        const data = await getPopularMovies(safePage);
        // Convert TMDB media items to our app's Movie type explicitly
        const convertedMovies = data.results.map((movie: TMDBMediaItem): Movie => ({
          id: movie.id,
          title: movie.title || '',
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path || null,
          overview: movie.overview || '',
          release_date: movie.release_date || '',
          vote_average: movie.vote_average || 0,
          genre_ids: movie.genre_ids || [],
          popularity: 0,
          vote_count: 0,
          media_type: 'movie'
        }));
        setMovies(convertedMovies);
        setTotalPages(Math.min(data.total_pages, TMDB_MAX_PAGE));
      } catch (error) {
        console.error("Erreur lors du chargement des films populaires:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMovies();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    // Assurer que la page est dans les limites valides
    const safePage = Math.min(newPage, TMDB_MAX_PAGE);
    setPage(safePage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background dark:bg-backgroundDark text-textDark dark:text-textLight">
      <div className="container-default py-8 animate-fade-in">
        <h1 className="heading-1 mb-6">Films Populaires</h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="media-grid">
              {movies.map((movie) => (
                <MediaCard 
                  key={movie.id}
                  media={movie}
                />
              ))}
            </div>

            <div className="mt-12">
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
