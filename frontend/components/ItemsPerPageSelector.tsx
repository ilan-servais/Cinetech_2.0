"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onChange?: (value: number) => void; // Optional callback for client-side
  baseUrl?: string; // Base URL for server-side
  options: number[];
  queryParams?: Record<string, string>; // Additional query parameters to preserve
  showCategoryFilter?: boolean;
  excludedGenres?: number[];
  onGenreFilterChange?: (ids: number[]) => void;
}

// Genre IDs and their labels
const CATEGORY_OPTIONS = [
  { id: 99, label: "Documentaires" },
  { id: 10763, label: "Talk-shows" },
  { id: 10764, label: "Télé-réalité" },
  { id: 10767, label: "Variétés" },
  { id: 10766, label: "Soap" },
];

const ItemsPerPageSelector: React.FC<ItemsPerPageSelectorProps> = ({ 
  itemsPerPage, 
  onChange,
  baseUrl,
  options,
  queryParams = {},
  showCategoryFilter = false,
  excludedGenres = [99, 10763, 10764, 10767],
  onGenreFilterChange
}) => {
  const router = useRouter();

  const handleChange = (newValue: number) => {
    if (onChange) {
      // Client-side handling
      onChange(newValue);
    } else if (baseUrl) {
      // Server-side navigation with URL
      const params = new URLSearchParams();
      
      // Add items parameter
      params.append('items', newValue.toString());
      
      // Add page parameter (reset to page 1 when changing items per page)
      params.append('page', '1');
      
      // Add any additional query parameters
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const queryString = params.toString();
      router.push(`${baseUrl}${queryString ? `?${queryString}` : ''}`);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="itemsPerPage" className="text-sm text-[#0D253F] dark:text-white">
          Éléments par page:
        </label>
        <select 
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="px-2 py-1 border rounded bg-white text-[#0D253F] text-sm focus:outline-none focus:ring-1 focus:ring-accent dark:bg-gray-800 border-gray-300 dark:border-gray-700 dark:text-white"
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {showCategoryFilter && onGenreFilterChange && (
        <div className="flex flex-wrap gap-4 py-2">
          <span className="text-sm text-[#0D253F] font-medium">Masquer:</span>
          {CATEGORY_OPTIONS.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={excludedGenres.includes(id)}
                onChange={(e) => {
                  const newIds = e.target.checked
                    ? [...excludedGenres, id]
                    : excludedGenres.filter(genreId => genreId !== id);
                  onGenreFilterChange(newIds);
                }}
                className="accent-accent"
              />
              <span className="text-sm text-[#0D253F]">{label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemsPerPageSelector;
