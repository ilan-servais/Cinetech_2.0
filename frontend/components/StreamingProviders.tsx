import Image from 'next/image';
import React from 'react';

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface StreamingProvidersProps {
  providers: Provider[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  showRemainingCount?: boolean;
}

const StreamingProviders: React.FC<StreamingProvidersProps> = ({ 
  providers, 
  size = 'md', 
  maxDisplay = 3, 
  showRemainingCount = false 
}) => {
  if (!providers || providers.length === 0) {
    return null;
  }

  const sizesMap = {
    sm: 16,
    md: 24,
    lg: 36,
  };

  const iconSize = sizesMap[size];
  const displayProviders = providers.slice(0, maxDisplay);
  const remainingCount = providers.length - maxDisplay;
  
  return (
    <div className="flex flex-wrap items-center gap-1">
      {displayProviders.map((provider) => (
        <div
          key={provider.provider_id}
          className="relative rounded-full overflow-hidden"
          style={{ width: iconSize, height: iconSize }}
          title={provider.provider_name}
        >
          <Image
            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
            alt={provider.provider_name}
            width={iconSize}
            height={iconSize}
            className="object-cover"
          />
        </div>
      ))}
      
      {showRemainingCount && remainingCount > 0 && (
        <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-700 dark:text-textLight py-0.5 px-2 rounded-full">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

export default StreamingProviders;
