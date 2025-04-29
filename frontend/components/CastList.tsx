import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CastMember } from '@/types/tmdb';

interface CastListProps {
  cast: CastMember[];
  limit?: number;
}

const CastList: React.FC<CastListProps> = ({ cast, limit = 5 }) => {
  // Fonction pour obtenir l'URL de l'image de profil ou une image par défaut
  const getProfileImage = (path: string | null) => {
    return path 
      ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W185}${path}` 
      : '/images/person-placeholder.jpg';
  };
  
  const displayCast = cast.slice(0, limit);
  
  if (displayCast.length === 0) {
    return <div className="text-gray-600">Aucune information sur le casting disponible.</div>;
  }
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-primary">Distribution principale</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
        {displayCast.map((member) => (
          <Link 
            key={member.id} 
            href={`/person/${member.id}`} 
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md flex-none w-36"
            aria-label={`Voir les détails de ${member.name}`}
          >
            <div className="relative h-48 w-36">
              <Image
                src={getProfileImage(member.profile_path)}
                alt={member.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <h4 className="font-bold text-sm">{member.name}</h4>
              <p className="text-gray-600 text-xs truncate">{member.character}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CastList;
