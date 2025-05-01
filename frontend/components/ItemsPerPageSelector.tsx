import React from 'react';

interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onChange: (value: number) => void;
  options: number[];
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
  options,
  showCategoryFilter = false,
  excludedGenres = [99, 10763, 10764, 10767],
  onGenreFilterChange
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="itemsPerPage" className="text-sm text-[#0D253F]">
          Éléments par page:
        </label>
        <select 
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onChange(Number(e.target.value))}
          className="px-2 py-1 border rounded bg-white text-[#0D253F] text-sm focus:outline-none focus:ring-1 focus:ring-accent"
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
