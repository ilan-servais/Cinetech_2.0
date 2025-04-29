import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CastListProps {
  cast: CastMember[];
  title?: string;
}

const CastList: React.FC<CastListProps> = ({ cast, title = "Têtes d'affiche" }) => {
  if (!cast || cast.length === 0) {
    return null;
  }

  const getProfileImage = (path: string | null) => {
    if (!path) return '/images/placeholder.png';
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W185}${path}`;
  };

  // Display up to 6 cast members
  const displayCast = cast.slice(0, 6);

  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayCast.map(member => (
          <Link key={member.id} href={`/person/${member.id}`} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md">
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={getProfileImage(member.profile_path)}
                alt={member.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                className="object-cover"
              />
            </div>
            <div className="p-2">
              <h4 className="font-bold text-sm">{member.name}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs truncate">{member.character}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CastList;
