import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMediaDetails, getMediaCredits } from '@/lib/tmdb';
import CastList from '@/components/CastList';
import FavoriteButton from '@/components/FavoriteButton';
import StreamingProviders from '@/components/StreamingProviders';
import { getCachedWatchProviders } from '@/lib/tmdb';

interface Props {
  params: {
    id: string;
  };
  searchParams: {
    type?: string;
  };
}

export default async function MediaDetailPage({ params, searchParams }: Props) {
  try {
    // Récupérer l'ID du média
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return notFound();
    }
    
    // Récupérer le type de média depuis les paramètres de recherche
    const mediaTypeFromParams = searchParams.type;
    
    // Récupérer les détails du média en passant le type si disponible
    const media = await getMediaDetails(id, mediaTypeFromParams);
    
    // Determine media type definitively from the API response
    const mediaType = media.media_type || 
                     (media.first_air_date ? 'tv' : 
                     (media.release_date ? 'movie' : 
                     (media.name ? 'tv' : 'movie')));
                     
    // S'assurer que mediaType est soit 'movie' soit 'tv'
    const safeMediaType = mediaType === 'tv' ? 'tv' : 'movie';
    const credits = await getMediaCredits(id, safeMediaType);
    const finalMediaType = safeMediaType;
    
    // Fetch streaming providers
    const watchProvidersData = await getCachedWatchProviders(Number(params.id), finalMediaType);
    
    // Fonction pour obtenir l'URL de l'affiche
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
      <div className="relative min-h-screen animate-fade-in bg-background">
        <div className="absolute top-0 inset-x-0 h-[500px] -z-10 overflow-hidden">
          {media.backdrop_path && (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getBackdropUrl(media.backdrop_path)})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-background" />
            </>
          )}
        </div>
        
        <div className="container-default pt-8 md:pt-12">
          {/* Fiche média */}
          <div className="bg-white dark:bg-backgroundDark text-textDark dark:text-textLight shadow-lg rounded-lg overflow-hidden mb-10">
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
                    <h3 className="text-lg font-bold mb-2 dark:text-textLight">Studios</h3>
                    <div className="flex flex-wrap gap-4">
                      {studios.map(studio => (
                        <div key={studio.id} className="bg-white dark:bg-dark-card p-2 rounded shadow-sm">
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
                <h1 className="text-2xl md:text-4xl font-bold text-primary dark:text-accent mb-2">
                  {title}
                </h1>
                
                {media.tagline && (
                  <p className="text-gray-600 dark:text-gray-400 italic mb-4">
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
                      <span className="text-sm px-2 py-0.5 bg-accent/20 text-primary rounded-full">
                        {media.status}
                      </span>
                    </>
                  )}
                  
                  {/* Type de média */}
                  <span className="text-sm px-2 py-0.5 bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent rounded-full ml-auto">
                    {finalMediaType === 'movie' ? 'Film' : 'Série'}
                  </span>
                </div>
                
                {/* Note */}
                {media.vote_average > 0 && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary text-textLight dark:bg-accent dark:text-primary flex items-center justify-center font-bold">
                      {media.vote_average.toFixed(1)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold dark:text-textLight">Note utilisateurs</div>
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
                    <h2 className="text-xl font-bold mb-2 text-primary dark:text-accent">Synopsis</h2>
                    <p className="text-gray-800 dark:text-gray-300 leading-relaxed">
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
                          <h3 className="text-lg font-bold text-primary dark:text-accent">Budget</h3>
                          <p className="text-gray-800 dark:text-gray-300">{formatCurrency(media.budget)}</p>
                        </div>
                      )}
                      
                      {media.revenue !== undefined && media.revenue > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-primary dark:text-accent">Recettes</h3>
                          <p className="text-gray-800 dark:text-gray-300">{formatCurrency(media.revenue)}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Studios de production (desktop) */}
                  {studios.length > 0 && (
                    <div className="hidden md:block">
                      <h3 className="text-lg font-bold text-primary dark:text-accent mb-2">Studios</h3>
                      <div className="flex flex-wrap gap-4">
                        {studios.map(studio => (
                          <div key={studio.id} className="bg-white dark:bg-dark-card p-2 rounded shadow-sm">
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
                
                {/* Disponible en streaming */}
                {watchProvidersData && watchProvidersData.providers.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2 text-primary">
                      {watchProvidersData.type === 'flatrate' 
                        ? 'Disponible en streaming sur' 
                        : watchProvidersData.type === 'rent' 
                          ? 'Disponible à la location sur' 
                          : 'Disponible à l\'achat sur'}
                    </h2>
                    <StreamingProviders 
                      providers={watchProvidersData.providers} 
                      size="lg" 
                      maxDisplay={8}
                    />
                  </div>
                )}
                
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
                <CastList cast={credits.cast.slice(0, 5)} />
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
