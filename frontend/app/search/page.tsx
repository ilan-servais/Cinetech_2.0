"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchMulti, TMDB_MAX_PAGE } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { filterPureCinema } from '@/lib/utils';
import Pagination from '@/components/Pagination';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const pageParam = searchParams.get('page') || '1';
  const parsedPage = parseInt(pageParam, 10);
  const initialPage = isNaN(parsedPage) ? 1 : Math.min(parsedPage, TMDB_MAX_PAGE);
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchResults, setSearchResults] = useState<any>({ results: [], total_pages: 0, total_results: 0 });
  const [loading, setLoading] = useState(false);

  // Redirect if page parameter is too high
  useEffect(() => {
    if (parsedPage > TMDB_MAX_PAGE) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', TMDB_MAX_PAGE.toString());
      router.replace(`/search?${newParams.toString()}`);
    }
  }, [parsedPage, searchParams, router]);

  // Effectuer la recherche lorsque la requête change
  useEffect(() => {
    const safePage = Math.min(currentPage, TMDB_MAX_PAGE);
    
    const performSearch = async () => {
      if (!query) {
        setSearchResults({ results: [], total_pages: 0, total_results: 0 });
        return;
      }
      
      setLoading(true);
      try {
        const results = await searchMulti(query, safePage);
        
        // Apply permanent filtering to search results
        results.results = filterPureCinema(results.results);
        
        // Ensure total_pages is capped
        results.total_pages = Math.min(results.total_pages, TMDB_MAX_PAGE);
        
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [query, currentPage]);
  
  // Gérer le changement de page
  const handlePageChange = (pageNumber: number) => {
    // Ensure we're within limits
    const safePage = Math.min(pageNumber, TMDB_MAX_PAGE);
    
    setCurrentPage(safePage);
    
    // Update URL to reflect page change
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', safePage.toString());
    router.push(`/search?${newParams.toString()}`);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="bg-[#E3F3FF] min-h-screen py-12 dark:bg-backgroundDark">
      <div className="container-default animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[#0D253F]">
            {query ? `Résultats pour "${query}"` : 'Rechercher'}
          </h1>
          
          {/* Barre de recherche */}
          <div className="mb-8">
            <SearchBar initialQuery={query} />
          </div>
          
          {/* Résultats de recherche ou état vide */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : !query ? (
            <div className="text-center p-12 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recherchez votre film ou série préféré</h2>
              <p className="text-[#0D253F] mb-4">
                Utilisez la barre de recherche ci-dessus pour trouver des films, séries ou artistes.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Link href="/movies" className="btn-primary">
                  Parcourir les films
                </Link>
                <Link href="/series" className="btn-secondary">
                  Parcourir les séries
                </Link>
              </div>
            </div>
          ) : searchResults.results.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Aucun résultat trouvé</h2>
              <p className="text-[#0D253F]">
                Désolé, nous n'avons trouvé aucun résultat pour "{query}".
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-[#0D253F]">
                {searchResults.total_results} résultats trouvés
              </p>
              
              <div className="media-grid">
                {searchResults.results.map((item: any) => {
                  // Assurons-nous que chaque élément a un media_type défini
                  const mediaWithType = {
                    ...item,
                    media_type: item.media_type || (item.title ? 'movie' : 'tv')
                  };
                  return <MediaCard key={item.id} media={mediaWithType} />;
                })}
              </div>
              
              {/* Pagination */}
              {searchResults.total_pages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={searchResults.total_pages} 
                    onPageChange={handlePageChange}
                    siblingCount={2}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
