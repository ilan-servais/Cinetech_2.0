import React from 'react';
import { EXCLUDED_GENRE_IDS } from '@/lib/utils';

// Genre IDs and their labels
const CATEGORY_OPTIONS = [
  { id: 99, label: "Documentaires" },
  { id: 10763, label: "Talk-shows" },
  { id: 10764, label: "Télé-réalité" },
  { id: 10767, label: "Variétés" },
  { id: 10766, label: "Soap" },
];

interface CategoryFilterProps {
  excluded: number[];
  onChange: (ids: number[]) => void;
  className?: string;
}

export default function CategoryFilter({ 
  excluded = EXCLUDED_GENRE_IDS, 
  onChange,
  className = ""
}: CategoryFilterProps) {
  return (
    <div className={`flex gap-4 flex-wrap ${className}`}>
      <span className="text-sm text-[#0D253F] font-medium">Masquer:</span>
      {CATEGORY_OPTIONS.map(({ id, label }) => (
        <label key={id} className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={excluded.includes(id)}
            onChange={(e) => {
              const isChecked = e.target.checked;
              const newIds = isChecked
                ? [...excluded, id]
                : excluded.filter(genreId => genreId !== id);
              onChange(newIds);
            }}
            className="accent-accent"
          />
          <span className="text-sm text-[#0D253F]">{label}</span>
        </label>
      ))}
    </div>
  );
}
