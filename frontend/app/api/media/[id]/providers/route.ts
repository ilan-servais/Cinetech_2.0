import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_TMDB_API_URL || 'https://api.themoviedb.org/3';
const DEFAULT_COUNTRY = 'FR';

interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

function extractProviders(
  countryData: any,
  fallbackToRent: boolean = true,
  fallbackToBuy: boolean = true
): { providers: Provider[], type: 'flatrate' | 'rent' | 'buy' | null } | null {
  // First try flatrate (streaming)
  if (countryData.flatrate && countryData.flatrate.length > 0) {
    return { providers: countryData.flatrate, type: 'flatrate' };
  }
  
  // Fallback to rent if no flatrate
  if (fallbackToRent && countryData.rent && countryData.rent.length > 0) {
    return { providers: countryData.rent, type: 'rent' };
  }
  
  // Fallback to buy if no flatrate or rent
  if (fallbackToBuy && countryData.buy && countryData.buy.length > 0) {
    return { providers: countryData.buy, type: 'buy' };
  }
  
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const searchParams = new URL(request.url).searchParams;
    const mediaType = searchParams.get('type');
    const countryCode = searchParams.get('country') || DEFAULT_COUNTRY;
    
    if (!mediaType || (mediaType !== 'movie' && mediaType !== 'tv')) {
      return NextResponse.json(
        { error: 'Le paramètre "type" doit être "movie" ou "tv"' },
        { status: 400 }
      );
    }
    
    const response = await fetch(
      `${API_URL}/${mediaType}/${id}/watch/providers?api_key=${API_KEY}`,
      { next: { revalidate: 3600 * 24 } } // Cache 24 heures
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Si aucun provider pour le pays spécifié
    if (!data.results || !data.results[countryCode]) {
      // Essayer d'autres pays communs
      const alternativeCountries = ['US', 'GB', 'CA', 'DE'];
      for (const altCountry of alternativeCountries) {
        if (data.results && data.results[altCountry]) {
          const result = extractProviders(data.results[altCountry], true, true);
          if (result) {
            return NextResponse.json(result);
          }
        }
      }
      
      return NextResponse.json({ providers: [], type: null });
    }
    
    const result = extractProviders(data.results[countryCode], true, true);
    
    if (!result) {
      return NextResponse.json({ providers: [], type: null });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching provider data:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
