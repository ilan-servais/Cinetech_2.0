import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMediaDetails } from '@/lib/tmdb';

// Type pour les paramètres de la page
type Props = {
  params: {
    id: string;
  };
};

async function MediaDetailPage({ params }: Props) {
  const { id } = params;
  
  try {
    // Récupération des détails du média (film ou série)
    const media = await getMediaDetails(Number(id));
    
    if (!media) {
      return notFound();
    }
    
    // Gestionnaire pour les images
    const getPosterUrl = (path: string | null) => {
      return path 
        ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W500}${path}` 
        : '/images/placeholder.jpg';
    };
    
    const getBackdropUrl = (path: string | null) => {
      return path 
        ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_ORIGINAL}${path}` 
        : null;
    };
    
    // Formatage de la date
    const formatDate = (dateString: string | undefined) => {
      if (!dateString) return 'Date inconnue';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    };
    
    // Titre du média (film ou série)
    const title = media.title || media.name || 'Sans titre';
    
    // Date de sortie (film) ou première diffusion (série)
    const releaseDate = media.release_date || media.first_air_date;
    
    return (
      <>
        {/* Fond avec backdrop du film/série */}
        {media.backdrop_path && (
          <div 
            className="fixed inset-0 z-0" 
            style={{
              backgroundImage: `url(${getBackdropUrl(media.backdrop_path)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-dark opacity-80 backdrop-blur-md"></div>
          </div>
        )}
        
        <div className="relative z-10 min-h-screen py-8">
          <div className="container mx-auto px-4">
            {/* Bouton retour */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-offwhite font-bold text-lg hover:bg-accent hover:text-dark transition-all duration-300 ease-in-out mb-6"
            >
              &larr; Retour
            </Link>
            
            {/* Contenu principal avec fond semi-transparent */}
            <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-lg">
              <div className="md:grid md:grid-cols-3 md:gap-8">
                {/* Poster du média */}
                <div className="mb-6 md:mb-0">
                  <div className="relative max-w-[300px] mx-auto md:mx-0 aspect-[2/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                    <Image
                      src={getPosterUrl(media.poster_path)}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 300px"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                
                {/* Informations du média */}
                <div className="md:col-span-2">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-display text-primary mb-4">
                    {title}
                  </h1>
                  
                  {releaseDate && (
                    <p className="mb-4 text-dark font-body">
                      <span className="font-bold">Sortie :</span> {formatDate(releaseDate)}
                    </p>
                  )}
                  
                  {media.vote_average && (
                    <p className="mb-4">
                      <span className="font-bold text-dark">Note :</span>{' '}
                      <span className="text-accent font-bold">
                        ⭐ {media.vote_average.toFixed(1)}/10
                      </span>
                    </p>
                  )}
                  
                  {media.genres && media.genres.length > 0 && (
                    <div className="mb-4">
                      <p className="font-bold text-dark mb-2">Genres :</p>
                      <div className="flex flex-wrap gap-2">
                        {media.genres.map((genre) => (
                          <span 
                            key={genre.id} 
                            className="px-3 py-1 bg-graylight rounded-full text-sm font-body"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {media.overview && (
                    <div className="mt-6">
                      <h2 className="text-xl font-bold mb-3 text-primary font-bold">Synopsis</h2>
                      <p className="text-dark font-body leading-relaxed">
                        {media.overview || "Aucune description disponible."}
                      </p>
                    </div>
                  )}
                  
                  {/* CTA */}
                  <div className="mt-8">
                    <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-offwhite font-bold text-lg hover:bg-accent hover:text-dark transition-all duration-300 ease-in-out">
                      Ajouter aux favoris
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
    
  } catch (error) {
    console.error('Error fetching media details:', error);
    return notFound();
  }
}

export default MediaDetailPage;
