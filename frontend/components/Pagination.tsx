import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1
}) => {
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

  const pages = generatePageNumbers();

  return (
    <nav aria-label="Pagination" className="flex justify-center py-4">
      <ul className="flex flex-wrap items-center gap-2">
        {/* Previous button */}
        <li>
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${
              currentPage === 1 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-accent hover:text-white'
            } dark:border-gray-700`}
            aria-label="Page précédente"
          >
            &laquo;
          </button>
        </li>

        {/* Page numbers */}
        {pages.map((page, i) => {
          // Handle ellipsis
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <li key={`ellipsis-${i}`} className="px-2">
                <span aria-hidden="true">...</span>
              </li>
            );
          }

          // Handle regular page numbers
          return (
            <li key={`page-${page}`}>
              <button
                onClick={() => onPageChange(page as number)}
                className={`w-10 h-10 flex items-center justify-center rounded-md border ${
                  currentPage === page
                    ? 'bg-accent text-white font-medium dark:bg-accent'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                } dark:border-gray-700`}
                aria-current={currentPage === page ? "page" : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            </li>
          );
        })}

        {/* Next button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md border ${
              currentPage === totalPages 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-accent hover:text-white'
            } dark:border-gray-700`}
            aria-label="Page suivante"
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
