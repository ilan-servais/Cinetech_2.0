"use client";

import React, { useState, useEffect } from 'react';
import { getPopularTvShows, TMDB_MAX_PAGE } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import { TVShow } from '@/types';

export default function PopularTVShowsPage() {
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const safePage = Math.min(page, TMDB_MAX_PAGE);
    if (page !== safePage) {
      setPage(safePage);
      return;
    }
    
    async function loadTvShows() {
      setIsLoading(true);
      try {
        const data = await getPopularTvShows(safePage);
        setTvShows(data.results);
        setTotalPages(Math.min(data.total_pages, TMDB_MAX_PAGE));
      } catch (error) {
        console.error("Erreur lors du chargement des séries populaires:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTvShows();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    // Assurer que la page est dans les limites valides
    const safePage = Math.min(newPage, TMDB_MAX_PAGE);
    setPage(safePage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-default py-8 animate-fade-in">
      <h1 className="heading-1 mb-6">Séries TV Populaires</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="media-grid">
            {tvShows.map((tvShow) => (
              <MediaCard 
                key={tvShow.id}
                media={{
                  id: tvShow.id,
                  name: tvShow.name,
                  poster_path: tvShow.poster_path,
                  first_air_date: tvShow.first_air_date,
                  vote_average: tvShow.vote_average,
                  media_type: 'tv',
                  overview: tvShow.overview,
                  backdrop_path: tvShow.backdrop_path,
                  genre_ids: tvShow.genre_ids
                }}
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
  );
}
