import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMediaDetails, getMediaCredits } from '@/lib/tmdb';
import CastList from '@/components/CastList';

// Type pour les paramètres de la page
type Props = {
  params: {
    id: string;
  };
};

export default async function MediaDetailPage({ params }: Props) {
  const { id } = params;
  
  try {
    // Récupération des détails du média
    const media = await getMediaDetails(Number(id));
    
    if (!media) {
      return notFound();
    }
    
    // Détermination du type de média
    const mediaType = media.title ? 'movie' : 'tv';
    
    // Récupération des informations sur le casting
    let credits;
    try {
      credits = await getMediaCredits(Number(id), mediaType as 'movie' | 'tv');
    } catch (error) {
      console.error('Error fetching credits:', error);
      credits = { cast: [], crew: [] };
    }
    
    // Helpers pour l'affichage du contenu
    const getPosterUrl = (path: string | null) => {
      return path 
        ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W500}${path}` 
        : '/images/placeholder.png';
    };
    
    const getBackdropUrl = (path: string | null) => {
      return path 
        ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_ORIGINAL}${path}` 
        : null;
    };
    
    // Formatage de la date de sortie
    const formatDate = (dateString: string | undefined) => {
      if (!dateString) return 'Date inconnue';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    };
    
    // Formatage de la durée pour les films
    const formatRuntime = (minutes: number | undefined) => {
      if (!minutes) return '';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}min`;
    };
    
    // Formatage du budget/des recettes
    const formatCurrency = (amount: number | undefined) => {
      if (!amount) return 'Non communiqué';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(amount);
    };
    
    // Titre du média et date de sortie
    const title = media.title || media.name || 'Sans titre';
    const releaseDate = media.release_date || media.first_air_date;
    const runtime = media.runtime ? formatRuntime(media.runtime) : '';
    
    return (
      <>
        {/* Fond avec backdrop du film/série */}
        {media.backdrop_path && (
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center blur-sm"
              style={{
                backgroundImage: `url(${getBackdropUrl(media.backdrop_path)})`,
                opacity: 0.4
              }}
            ></div>
          </div>
        )}
        
        <div className="relative z-10 container-default py-8">
          {/* Bouton retour */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-textLight font-bold mb-6"
          >
            ← Retour
          </Link>
          
          {/* Contenu principal du média */}
          <div className="bg-white/90 dark:bg-primary/90 p-6 rounded-xl shadow-lg backdrop-blur-sm">
            <div className="md:flex gap-8">
              {/* Poster du média */}
              <div className="mb-6 md:mb-0 flex-shrink-0">
                <div className="relative w-full max-w-xs md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={getPosterUrl(media.poster_path)}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              
              {/* Détails du média */}
              <div className="flex-grow">
                <h1 className="text-2xl md:text-4xl font-bold text-primary dark:text-textLight mb-2">
                  {title}
                </h1>
                
                {media.tagline && (
                  <p className="text-gray-600 dark:text-gray-300 italic mb-4">
                    {media.tagline}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {releaseDate && (
                    <span className="text-sm">
                      {formatDate(releaseDate)}
                    </span>
                  )}
                  
                  {runtime && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm">{runtime}</span>
                    </>
                  )}
                  
                  {media.status && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm">{media.status}</span>
                    </>
                  )}
                </div>
                
                {/* Note du média */}
                {media.vote_average > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-primary text-textLight rounded-full h-10 w-10 flex items-center justify-center font-bold">
                      {media.vote_average.toFixed(1)}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      ({media.vote_count} votes)
                    </span>
                  </div>
                )}
                
                {/* Genres du média */}
                {media.genres && media.genres.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {media.genres.map((genre) => (
                        <span 
                          key={genre.id} 
                          className="px-3 py-1 bg-accent/20 text-primary dark:bg-primary dark:text-accent rounded-full text-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Synopsis du média */}
                {media.overview && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">Synopsis</h2>
                    <p className="text-gray-800 dark:text-gray-200">
                      {media.overview || "Aucune description disponible."}
                    </p>
                  </div>
                )}
                
                {/* Budget & Recettes (uniquement pour les films) */}
                {mediaType === 'movie' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Fix: Add null check for budget */}
                    {media.budget !== undefined && media.budget > 0 && (
                      <div>
                        <h3 className="text-lg font-bold">Budget</h3>
                        <p>{formatCurrency(media.budget)}</p>
                      </div>
                    )}
                    
                    {/* Fix: Add null check for revenue */}
                    {media.revenue !== undefined && media.revenue > 0 && (
                      <div>
                        <h3 className="text-lg font-bold">Recettes</h3>
                        <p>{formatCurrency(media.revenue)}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Boutons d'action */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-accent text-primary font-bold rounded-md hover:bg-primary hover:text-textLight">
                    ★ Ajouter aux favoris
                  </button>
                  
                  {media.homepage && (
                    <a 
                      href={media.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary text-textLight font-bold rounded-md hover:bg-accent hover:text-primary"
                    >
                      🌐 Site officiel
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Casting */}
            {credits && credits.cast && credits.cast.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <CastList cast={credits.cast} />
              </div>
            )}
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error fetching media details:', error);
    return notFound();
  }
}
