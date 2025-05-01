"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void; // Optional callback for client-side pagination
  baseUrl?: string; // Base URL for server-side pagination
  queryParams?: Record<string, string | undefined>; // Additional query parameters to preserve
  siblingCount?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  baseUrl,
  queryParams = {},
  siblingCount = 1
}) => {
  const router = useRouter();
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Determine range of pages to show
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const generatePageNumbers = () => {
    // Always show first and last page
    const firstPage = 1;
    const lastPage = totalPages;
    
    // Calculate start and end of page range
    let startPage = Math.max(1, currentPage - siblingCount);
    let endPage = Math.min(totalPages, currentPage + siblingCount);
    
    // Adjust range if we're at the start or end
    if (currentPage <= siblingCount + 1) {
      endPage = Math.min(1 + siblingCount * 2, totalPages);
    } else if (currentPage >= totalPages - siblingCount) {
      startPage = Math.max(totalPages - siblingCount * 2, 1);
    }

    const pages = [];
    
    // Add first page if not in range
    if (startPage > firstPage) {
      pages.push(firstPage);
      // Add ellipsis if there's a gap
      if (startPage > firstPage + 1) {
        pages.push("ellipsis-start");
      }
    }
    
    // Add page range
    range(startPage, endPage).forEach(page => {
      pages.push(page);
    });
    
    // Add last page if not in range
    if (endPage < lastPage) {
      // Add ellipsis if there's a gap
      if (endPage < lastPage - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(lastPage);
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    
    if (onPageChange) {
      // Client-side navigation with callback
      onPageChange(page);
    } else if (baseUrl) {
      // Server-side navigation with URL
      const params = new URLSearchParams();
      
      // Add page parameter
      params.append('page', page.toString());
      
      // Add any additional query parameters
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const queryString = params.toString();
      router.push(`${baseUrl}${queryString ? `?${queryString}` : ''}`);
    }
  };

  // Create link for page number
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    // Add any additional query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  };

  const pages = generatePageNumbers();

  return (
    <nav aria-label="Pagination" className="flex justify-center mt-8">
      <ul className="flex items-center gap-2">
        {/* Previous button */}
        {currentPage > 1 && (
          <li>
            {onPageChange ? (
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                className="text-[#0D253F] dark:text-white hover:bg-accent/10 px-3 py-1 rounded"
                aria-label="Page précédente"
              >
                &#8249;
              </button>
            ) : (
              <Link 
                href={createPageUrl(currentPage - 1)}
                className="text-[#0D253F] dark:text-white hover:bg-accent/10 px-3 py-1 rounded" 
                aria-label="Page précédente"
              >
                &#8249;
              </Link>
            )}
          </li>
        )}

        {/* Page numbers */}
        {pages.map((page, i) => {
          // Handle ellipsis
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <li key={`ellipsis-${i}`}>
                <span className="px-3 py-1 text-[#0D253F] dark:text-white">
                  &#8230;
                </span>
              </li>
            );
          }

          // Handle regular page numbers
          const isActive = currentPage === page;
          
          return (
            <li key={`page-${page}`}>
              {onPageChange ? (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={`px-3 py-1 rounded ${isActive 
                    ? 'bg-accent text-white font-medium' 
                    : 'text-[#0D253F] dark:text-white hover:bg-accent/10'}`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              ) : (
                <Link 
                  href={createPageUrl(page as number)}
                  className={`px-3 py-1 rounded ${isActive 
                    ? 'bg-accent text-white font-medium' 
                    : 'text-[#0D253F] dark:text-white hover:bg-accent/10'}`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}

        {/* Next button */}
        {currentPage < totalPages && (
          <li>
            {onPageChange ? (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="text-[#0D253F] dark:text-white hover:bg-accent/10 px-3 py-1 rounded"
                aria-label="Page suivante"
              >
                &#8250;
              </button>
            ) : (
              <Link 
                href={createPageUrl(currentPage + 1)}
                className="text-[#0D253F] dark:text-white hover:bg-accent/10 px-3 py-1 rounded" 
                aria-label="Page suivante"
              >
                &#8250;
              </Link>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
