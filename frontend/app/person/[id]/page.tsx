"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MediaCard from "@/components/MediaCard";
import ItemsPerPageSelector from "@/components/ItemsPerPageSelector";
import { MediaItem } from "@/types/tmdb";

// Simple formatDate helper function
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
}

interface Credit {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: string;
  character?: string;
  job?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number; // Ajout de cette propriété
}

// Composant qui étend MediaCard pour afficher le rôle ou le job
const MediaCardWithRole: React.FC<{
  media: MediaItem,
  role?: string
}> = ({ media, role }) => {
  const title = media.title || media.name || 'Sans titre';
  const mediaType = media.media_type || (media.title ? 'movie' : 'tv');
  const releaseYear = media.release_date || media.first_air_date 
    ? new Date(media.release_date || media.first_air_date || "").getFullYear() 
    : '';
  const href = `/media/${media.id}?type=${mediaType}`;
  
  // Fonction pour obtenir l'URL de l'image du poster
  const getPosterImage = (path: string | null) => {
    if (!path) return '/images/placeholder.jpg';
    return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W342 || 'https://image.tmdb.org/t/p/w342'}${path}`;
  };

  return (
    <Link 
      href={href} 
      className="media-card block h-full"
      aria-label={`Voir les détails de ${title}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
        <Image
          src={getPosterImage(media.poster_path)}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
          className="object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Cpath d='M0 0h40v60H0z' fill='%23e5e7eb'/%3E%3C/svg%3E"
        />
        {media.vote_average !== undefined && media.vote_average > 0 && (
          <div className="absolute bottom-2 left-2 bg-primary text-textLight text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center">
            {Math.round(media.vote_average * 10) / 10}
          </div>
        )}
        <div className="absolute top-2 right-2">
          {mediaType === 'movie' && (
            <span className="bg-primary text-textLight text-xs px-2 py-1 rounded-full">Film</span>
          )}
          {mediaType === 'tv' && (
            <span className="bg-accent text-primary text-xs px-2 py-1 rounded-full">Série</span>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        <p className="text-gray-600 text-xs">
          {releaseYear || 'Date inconnue'}
        </p>
        {role && (
          <p className="text-[#0D253F]/70 text-xs mt-1 italic truncate">
            {role}
          </p>
        )}
      </div>
    </Link>
  );
};

// New pagination component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void 
}) => {
  return (
    <div className="flex justify-center items-center mt-8 gap-4">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded ${currentPage === 1 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-accent/20 text-accent hover:bg-accent hover:text-white'}`}
      >
        Précédent
      </button>
      
      <span className="text-[#0D253F] font-medium">
        Page {currentPage} / {totalPages}
      </span>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded ${currentPage === totalPages 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-accent/20 text-accent hover:bg-accent hover:text-white'}`}
      >
        Suivant
      </button>
    </div>
  );
};

export default function PersonDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const fetchPersonDetails = async () => {
      try {
        setLoading(true);
        // Fetch person details
        const personResponse = await fetch(`/api/person/${id}`);
        if (!personResponse.ok) {
          const errorData = await personResponse.json();
          throw new Error(errorData.error || "Failed to fetch person details");
        }
        const personData = await personResponse.json();
        setPerson(personData);

        // Fetch credits
        const creditsResponse = await fetch(`/api/person/${id}/credits`);
        if (!creditsResponse.ok) {
          const errorData = await creditsResponse.json();
          throw new Error(errorData.error || "Failed to fetch credits");
        }
        const creditsData = await creditsResponse.json();
        
        // Sort credits by popularity or release date
        const sortedCredits = [...creditsData.cast, ...creditsData.crew]
          .sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date || "");
            const dateB = new Date(b.release_date || b.first_air_date || "");
            return dateB.getTime() - dateA.getTime();
          })
          // Remove duplicates (same movie appearing in both cast and crew)
          .filter((credit, index, self) => 
            index === self.findIndex((c) => c.id === credit.id)
          );
        
        setCredits(sortedCredits);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des données.");
        setLoading(false);
      }
    };

    if (id) {
      fetchPersonDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#E3F3FF] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-[#0D253F]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="bg-[#E3F3FF] min-h-screen py-16">
        <div className="container-default animate-fade-in">
          <div className="text-[#0D253F] text-center">
            <h1 className="text-2xl font-bold mb-4">Erreur</h1>
            <p>{error || "Impossible de charger les détails de cette personne."}</p>
            <Link href="/" className="btn-primary mt-6 inline-block">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generate a blurDataURL placeholder (simple colored rectangle)
  const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjZCIvPjwvc3ZnPg==";

  // Calculate pagination
  const totalPages = Math.ceil(credits.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCredits = credits.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Smooth scroll back to the filmography section
    document.getElementById('filmography')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#E3F3FF] min-h-screen">
      <div className="container-default py-8 md:py-16 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0D253F] mb-6 md:mb-10 text-center md:text-left">
          {person.name}
        </h1>
        
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Profile image */}
          <div className="mx-auto md:mx-0 w-full max-w-[250px]">
            {person.profile_path ? (
              <div className="relative aspect-[2/3] w-full">
                <Image 
                  src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                  alt={person.name}
                  fill
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                  className="rounded-xl shadow object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[2/3] w-full bg-gray-200 rounded-xl shadow flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Personal details */}
            <div className="mt-6 text-[#0D253F]">
              {person.birthday && (
                <p className="mb-2">
                  <span className="font-semibold">Né(e) le:</span> {formatDate(person.birthday)}
                </p>
              )}
              {person.deathday && (
                <p className="mb-2">
                  <span className="font-semibold">Décès:</span> {formatDate(person.deathday)}
                </p>
              )}
              {person.place_of_birth && (
                <p className="mb-2">
                  <span className="font-semibold">Lieu de naissance:</span> {person.place_of_birth}
                </p>
              )}
              <p className="mb-2">
                <span className="font-semibold">Profession:</span> {person.known_for_department}
              </p>
            </div>
          </div>

          {/* Biography */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4 text-[#0D253F]">Biographie</h2>
            {person.biography ? (
              <p className="text-[#0D253F] leading-relaxed whitespace-pre-line">
                {person.biography}
              </p>
            ) : (
              <p className="text-gray-500 italic">Aucune biographie disponible.</p>
            )}
          </div>
        </div>

        {/* Filmography with pagination */}
        {credits.length > 0 && (
          <div id="filmography">
            <h2 className="text-2xl font-bold mb-6 text-[#0D253F]">Filmographie</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {currentCredits.map((credit) => (
                <div key={`${credit.id}-${credit.character || credit.job}`} className="flex-none">
                  <MediaCardWithRole
                    media={{
                      id: credit.id,
                      title: credit.title || credit.name || "",
                      poster_path: credit.poster_path,
                      media_type: credit.media_type || (credit.title ? 'movie' : 'tv'),
                      vote_average: credit.vote_average || 0,
                      release_date: credit.release_date || credit.first_air_date || "",
                      first_air_date: credit.first_air_date || ""
                    }}
                    role={credit.character ? `Rôle : ${credit.character}` : credit.job}
                  />
                </div>
              ))}
            </div>

            {/* Add pagination component if we have more than one page */}
            {totalPages > 1 && (
              <>
                <div className="flex justify-between items-center mt-8">
                  <ItemsPerPageSelector 
                    itemsPerPage={itemsPerPage}
                    onChange={(value) => {
                      setItemsPerPage(value);
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    options={[12, 24, 36, 48]}
                  />
                  <span className="text-sm text-gray-600">
                    Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, credits.length)} sur {credits.length} titres
                  </span>
                </div>
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
              </>
            )}
          </div>
        )}

        {/* Back button */}
        <div className="mt-12 flex justify-center md:justify-start">
          <Link href="/" className="btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
