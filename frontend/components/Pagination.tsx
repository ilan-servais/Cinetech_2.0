"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  totalPages,
  onPageChange,
  siblingCount = 1,
  baseUrl,
  queryParams = {},
}) => {
  // Ne pas rendre la pagination s'il n'y a qu'une seule page
  if (totalPages <= 1) return null;

  // Fonction pour créer l'URL pour la pagination côté serveur
  const createPageUrl = (page: number): string => {
    if (!baseUrl) return '#';

    const params = new URLSearchParams();
    params.set('page', page.toString());

    // Ajouter les autres paramètres de requête
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
      {/* Bouton précédent */}
      {currentPage > 1 && (
        onPageChange ? (
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            className="mx-1 px-4 py-2 bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out"
          >
            &lt;
          </button>
        ) : (
          <Link 
            href={createPageUrl(currentPage - 1)}
            className="mx-1 px-4 py-2 bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out"
          >
            &lt;
          </Link>
        )
      )}
      
      {/* Numéros de page */}
      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === -1 ? (
            <span className="mx-1 px-4 py-2">…</span>
          ) : (
            onPageChange ? (
              <button
                onClick={() => onPageChange(page)}
                className={`mx-1 px-4 py-2 ${
                  page === currentPage
                    ? 'bg-accent text-textLight font-bold'
                    : 'bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out'
                }`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ) : (
              <Link
                href={createPageUrl(page)}
                className={`mx-1 px-4 py-2 ${
                  page === currentPage
                    ? 'bg-accent text-textLight font-bold'
                    : 'bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out'
                }`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </Link>
            )
          )}
        </React.Fragment>
      ))}

      {/* Bouton suivant */}
      {currentPage < totalPages && (
        onPageChange ? (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="mx-1 px-4 py-2 bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out"
          >
            &gt;
          </button>
        ) : (
          <Link 
            href={createPageUrl(currentPage + 1)}
            className="mx-1 px-4 py-2 bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out"
          >
            &gt;
          </Link>
        )
      )}
    </div>
  );
};

export default Pagination;
