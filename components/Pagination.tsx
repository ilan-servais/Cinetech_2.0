"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TMDB_MAX_PAGE } from '@/lib/tmdb';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  baseUrl?: string;
  queryParams?: Record<string, string | undefined>;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages: rawTotalPages,
  onPageChange,
  siblingCount = 1,
  baseUrl,
  queryParams = {},
}) => {
  // Limiter le nombre total de pages à TMDB_MAX_PAGE
  const totalPages = Math.min(rawTotalPages, TMDB_MAX_PAGE);
  
  // Ne pas rendre la pagination s'il n'y a qu'une seule page
  if (totalPages <= 1) return null;

  // Fonction pour créer l'URL pour la pagination côté serveur
  const createPageUrl = (page: number): string => {
    if (!baseUrl) return '#';

    const params = new URLSearchParams();
    params.set('page', page.toString());
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const getPageNumbers = (): number[] => {
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);
      const pages = [1];

      if (startPage > 2) pages.push(-1); // pour l'ellipse

      for (let i = startPage; i <= endPage; i++) pages.push(i);

      if (endPage < totalPages - 1) pages.push(-1);

      pages.push(totalPages);
      return pages;
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  return (
    <div className="flex justify-center mt-8">
      <ul className="flex flex-wrap justify-center gap-y-4">
        {/* Bouton précédent */}
        {currentPage > 1 && (
          <li className="m-1 flex-shrink-0">
            {onPageChange ? (
              <button 
                onClick={() => onPageChange(currentPage - 1)}
                className="px-4 py-2 bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out rounded-md"
                aria-label="Page précédente"
              >
                &lt;
              </button>
            ) : (
              <Link 
                href={createPageUrl(currentPage - 1)} 
                className="px-4 py-2 bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out rounded-md"
                aria-label="Page précédente"
              >
                &lt;
              </Link>
            )}
          </li>
        )}
        
        {/* Numéros de page */}
        {getPageNumbers().map((pageNum, index) => (
          <li key={index} className="m-1 flex-shrink-0">
            {pageNum === -1 ? (
              // Ellipse pour les pages omises
              <span className="px-4 py-2">...</span>
            ) : (
              // Bouton de page normal
              onPageChange ? (
                <button
                  onClick={() => onPageChange(pageNum)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-primary text-textLight dark:bg-accent dark:text-primary'
                      : 'bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out'
                  }`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              ) : (
                <Link
                  href={createPageUrl(pageNum)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-primary text-textLight dark:bg-accent dark:text-primary'
                      : 'bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out'
                  }`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </Link>
              )
            )}
          </li>
        ))}
        
        {/* Bouton suivant */}
        {currentPage < totalPages && (
          <li className="m-1 flex-shrink-0">
            {onPageChange ? (
              <button
                onClick={() => onPageChange(currentPage + 1)}
                className="px-4 py-2 bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out rounded-md"
                aria-label="Page suivante"
              >
                &gt;
              </button>
            ) : (
              <Link
                href={createPageUrl(currentPage + 1)}
                className="px-4 py-2 bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out rounded-md"
                aria-label="Page suivante"
              >
                &gt;
              </Link>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default Pagination;
