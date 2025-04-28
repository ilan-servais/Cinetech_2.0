import { getMediaDetails } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MediaPageProps {
  params: {
    id: string;
  };
}

export default async function MediaPage({ params }: MediaPageProps) {
  try {
    const media = await getMediaDetails(params.id);
    
    if (!media) {
      return notFound();
    }

    const title = media.title || media.name || 'Sans titre';
    const releaseDate = media.release_date || media.first_air_date;
    const formattedDate = releaseDate 
      ? new Date(releaseDate).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : 'Date inconnue';
    
    const posterUrl = media.poster_path
      ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W500}${media.poster_path}`
      : '/images/placeholder.png';
      
    const backdropUrl = media.backdrop_path
      ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_ORIGINAL}${media.backdrop_path}`
      : null;
      
    const rating = media.vote_average.toFixed(1);

    return (
      <div className="min-h-screen relative">
        {/* Backdrop image - Bonus */}
        {backdropUrl && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/70 z-10" />
            <Image
              src={backdropUrl}
              alt={title}
              fill
              className="object-cover opacity-30"
              priority
            />
          </div>
        )}

        <div className="relative z-10 container mx-auto px-4 py-8">
          <Link 
            href="/"
            className="inline-flex items-center mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>← Retour</span>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Poster Image */}
              <div className="md:w-1/3 lg:w-1/4">
                <div className="relative aspect-[2/3] w-full">
                  <Image
                    src={posterUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 md:w-2/3 lg:w-3/4">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span>{rating}/10</span>
                  </div>
                  <div>{formattedDate}</div>
                </div>

                {media.tagline && (
                  <p className="text-gray-500 italic mb-4">"{media.tagline}"</p>
                )}

                <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
                <p className="mb-4">
                  {media.overview || "Aucune description disponible."}
                </p>
                
                {media.genres && media.genres.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-2">Genres</h2>
                    <div className="flex flex-wrap gap-2">
                      {media.genres.map(genre => (
                        <span 
                          key={genre.id} 
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching media details:', error);
    return notFound();
  }
}
