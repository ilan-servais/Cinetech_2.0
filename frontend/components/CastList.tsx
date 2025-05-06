import React from 'react';
import Link from 'next/link';
import { CastMember } from '@/types/tmdb';
import TMDBImage from './TMDBImage';

interface CastListProps {
  cast: CastMember[];
  limit?: number;
}

const CastList: React.FC<CastListProps> = ({ cast, limit = 5 }) => {
  const displayCast = cast.slice(0, limit);
  
  if (displayCast.length === 0) {
    return <div className="text-gray-600">Aucune information sur le casting disponible.</div>;
  }
  
  return (
    <div className="mb-8 light-mode">
      <h2 className="text-xl font-bold mb-4 text-[#0D253F]">Distribution principale</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
        {displayCast.map((member) => (
          <Link 
            key={member.id} 
            href={`/person/${member.id}`} 
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md flex-none w-36"
            aria-label={`Voir les détails de ${member.name}`}
          >
            <div className="relative h-48 w-36">
              <TMDBImage
                path={member.profile_path}
                type="profile"
                size="w185"
                alt={member.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3 bg-white">
              <h4 className="font-bold text-sm text-gray-900">{member.name}</h4>
              <p className="text-gray-600 text-xs truncate">{member.character}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CastList;
