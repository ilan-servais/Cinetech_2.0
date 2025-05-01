import React from 'react';
import Image from 'next/image';

interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface StreamingProvidersProps {
  providers?: Provider[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showAllTypes?: boolean; // Whether to show flatrate, rent and buy options
}

const StreamingProviders: React.FC<StreamingProvidersProps> = ({ 
  providers, 
  maxDisplay = 4,
  size = 'md',
  className = '',
  showAllTypes = false
}) => {
  if (!providers || providers.length === 0) {
    return null;
  }

  // Sort providers by display_priority (lower values first)
  const sortedProviders = [...providers].sort((a, b) => a.display_priority - b.display_priority);
  const displayProviders = sortedProviders.slice(0, maxDisplay);
  const remainingCount = sortedProviders.length > maxDisplay ? sortedProviders.length - maxDisplay : 0;
  
  // Define logo size based on the size prop
  const logoSize = size === 'sm' ? 20 : size === 'md' ? 32 : 40;
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayProviders.map((provider) => (
        <div 
          key={provider.provider_id} 
          className="relative rounded-md overflow-hidden shadow-sm" 
          title={provider.provider_name}
          style={{ width: logoSize, height: logoSize }}
        >
          <Image
            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
            alt={provider.provider_name}
            fill
            sizes={`${logoSize}px`}
            className="object-contain" // Changed from object-cover to object-contain
            // Remove the style prop that conflicts with 'fill'
            // style={{ height: "auto" }} - this line is removed
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div 
          className="flex items-center justify-center bg-gray-200 text-gray-600 font-medium rounded-md text-xs"
          style={{ width: logoSize, height: logoSize }}
          title={`${remainingCount} autres plateformes`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default StreamingProviders;
