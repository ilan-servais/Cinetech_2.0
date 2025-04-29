import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMediaDetails, getMediaCredits } from '@/lib/tmdb';
import CastList from '@/components/CastList';
import FavoriteButton from '@/components/FavoriteButton';

// Type pour les paramètres de la page
type Props = {
  params: {
    id: string;
  };
  searchParams?: { 
    type?: string 
  };
};

export default async function MediaDetailPage({ params, searchParams }: Props) {
  const { id } = params;
  const mediaType = searchParams?.type;
  
  try {
    // Récupération des détails du média
    const media = await getMediaDetails(Number(id), mediaType);
    
    if (!media) {
      return notFound();
    }
    
    // Détermination du type de média
    const finalMediaType = media.title ? 'movie' : 'tv';
    
    // Récupération des informations sur le casting
    let credits;
    try {
      credits = await getMediaCredits(Number(id), finalMediaType as 'movie' | 'tv');
    } catch (error) {
      console.error('Error fetching credits:', error);
      credits = { cast: [], crew: [] };
    }
    
    // Helpers pour l'affichage du contenu
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
    
    // Récupérer les studios de production, si disponibles
    const studios = media.production_companies?.slice(0, 3) || [];
    
    return (
      <div className="relative min-h-screen animate-fade-in">
        {/* Backdrop avec overlay */}
        <div className="absolute top-0 inset-x-0 h-[500px] -z-10 overflow-hidden">
          {media.backdrop_path && (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getBackdropUrl(media.backdrop_path)})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-background dark:to-primary" />
            </>
          )}
        </div>
        
        <div className="container-default pt-8 md:pt-12">
          {/* Fil d'Ariane */}
          <nav className="flex mb-6 text-sm text-white/80" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-white">Accueil</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link href={finalMediaType === 'movie' ? '/movies' : '/series'} className="hover:text-white">
                    {finalMediaType === 'movie' ? 'Films' : 'Séries'}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2">/</span>
                  <span className="truncate max-w-[150px] sm:max-w-xs">{title}</span>
                </div>
              </li>
            </ol>
          </nav>
          
          {/* Fiche média */}
          <div className="bg-background dark:bg-primary/90 shadow-lg rounded-lg overflow-hidden mb-10">
            <div className="p-6 md:flex gap-8">
              {/* Colonne poster */}
              <div className="mb-6 md:mb-0 flex-shrink-0">
                <div className="relative w-full max-w-xs mx-auto md:mx-0 md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={getPosterUrl(media.poster_path)}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                    priority
                  />
                </div>
                
                {/* Studios de production (sur mobile uniquement) */}
                {studios.length > 0 && (
                  <div className="mt-4 md:hidden">
                    <h3 className="text-lg font-bold mb-2">Studios</h3>
                    <div className="flex flex-wrap gap-4">
                      {studios.map(studio => (
                        <div key={studio.id} className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                          {studio.logo_path ? (
                            <Image 
                              src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W185}${studio.logo_path}`}
                              alt={studio.name}
                              width={80}
                              height={30}
                              className="object-contain h-6"
                            />
                          ) : (
                            <span className="text-xs">{studio.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Colonne détails */}
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
                    <span className="text-sm font-medium">
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
                      <span className="text-sm px-2 py-0.5 bg-accent/20 text-primary dark:text-accent rounded-full">
                        {media.status}
                      </span>
                    </>
                  )}
                  
                  {/* Type de média */}
                  <span className="text-sm px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary dark:text-textLight rounded-full ml-auto">
                    {finalMediaType === 'movie' ? 'Film' : 'Série'}
                  </span>
                </div>
                
                {/* Note */}
                {media.vote_average > 0 && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary dark:bg-accent text-textLight flex items-center justify-center font-bold">
                      {media.vote_average.toFixed(1)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Note utilisateurs</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">({media.vote_count} votes)</div>
                    </div>
                  </div>
                )}
                
                {/* Genres */}
                {media.genres && media.genres.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {media.genres.map((genre) => (
                        <span 
                          key={genre.id} 
                          className="px-3 py-1 bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent rounded-full text-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Synopsis */}
                {media.overview && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2 text-primary dark:text-textLight">Synopsis</h2>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {media.overview || "Aucune description disponible."}
                    </p>
                  </div>
                )}
                
                {/* Grid d'informations supplémentaires */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  {/* Budget & Recettes (uniquement pour les films) */}
                  {finalMediaType === 'movie' && (
                    <>
                      {media.budget !== undefined && media.budget > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-primary dark:text-textLight">Budget</h3>
                          <p className="text-gray-800 dark:text-gray-200">{formatCurrency(media.budget)}</p>
                        </div>
                      )}
                      
                      {media.revenue !== undefined && media.revenue > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-primary dark:text-textLight">Recettes</h3>
                          <p className="text-gray-800 dark:text-gray-200">{formatCurrency(media.revenue)}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Studios de production (desktop) */}
                  {studios.length > 0 && (
                    <div className="hidden md:block">
                      <h3 className="text-lg font-bold text-primary dark:text-textLight mb-2">Studios</h3>
                      <div className="flex flex-wrap gap-4">
                        {studios.map(studio => (
                          <div key={studio.id} className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                            {studio.logo_path ? (
                              <Image 
                                src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W185}${studio.logo_path}`}
                                alt={studio.name}
                                width={80}
                                height={30}
                                className="object-contain h-6"
                              />
                            ) : (
                              <span className="text-sm">{studio.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Boutons d'action */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <FavoriteButton media={media} />
                  
                  {media.homepage && (
                    <a 
                      href={media.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary text-textLight font-bold rounded-md hover:bg-accent hover:text-primary transition-colors"
                      aria-label="Visiter le site officiel"
                    >
                      🌐 Site officiel
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Distribution */}
            {credits && credits.cast && credits.cast.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 mx-6 pt-6 pb-2">
                <CastList cast={credits.cast} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching media details:', error);
    return notFound();
  }
}
