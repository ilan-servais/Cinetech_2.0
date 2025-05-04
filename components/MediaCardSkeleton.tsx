import React from 'react';

interface MediaCardSkeletonProps {
  className?: string;
}

const MediaCardSkeleton: React.FC<MediaCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`media-card animate-pulse ${className}`}>
      <div className="relative aspect-[2/3] w-full bg-gray-300"></div>
      <div className="p-3 bg-white">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default MediaCardSkeleton;
