"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMulti } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { filterPureCinema } from '@/lib/utils';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState<any>({ results: [], total_pages: 0, total_results: 0 });
  const [loading, setLoading] = useState(false);

  // Effectuer la recherche lorsque la requête change
  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setSearchResults({ results: [], total_pages: 0, total_results: 0 });
        return;
      }
      
      setLoading(true);
      try {
        const results = await searchMulti(query, currentPage);
        
        // Apply permanent filtering to search results
        results.results = filterPureCinema(results.results);
        
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
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Obtenir les pages à afficher (5 maximum)
  const getPageNumbers = () => {
    const totalPages = Math.min(searchResults.total_pages || 0, 500); // API TMDB limite à 500 pages
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Si on est près du début
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    
    // Si on est près de la fin
    if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    // Au milieu
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
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
                <div className="flex justify-center mt-12 gap-2">
                  {currentPage > 1 && (
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-4 py-2 rounded-md bg-gray-200 text-[#0D253F]"
                      aria-label="Page précédente"
                    >
                      &lt;
                    </button>
                  )}
                  
                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-md ${
                        pageNum === currentPage 
                          ? 'bg-accent text-textLight' 
                          : 'bg-gray-200 text-[#0D253F]'
                      }`}
                      aria-label={`Page ${pageNum}`}
                      aria-current={pageNum === currentPage ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  {currentPage < searchResults.total_pages && (
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-4 py-2 rounded-md bg-gray-200 text-[#0D253F]"
                      aria-label="Page suivante"
                    >
                      &gt;
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
