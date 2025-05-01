import React from 'react';

interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onChange: (value: number) => void;
  options: number[];
}

const ItemsPerPageSelector: React.FC<ItemsPerPageSelectorProps> = ({ 
  itemsPerPage, 
  onChange, 
  options 
}) => {
  return (
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
  );
};

export default ItemsPerPageSelector;
