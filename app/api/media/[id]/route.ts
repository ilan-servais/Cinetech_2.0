import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_TMDB_API_URL || 'https://api.themoviedb.org/3';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const searchParams = new URL(request.url).searchParams;
    const mediaType = searchParams.get('type') || '';
    
    // Si un type de média est spécifié, l'utiliser directement
    if (mediaType && (mediaType === 'movie' || mediaType === 'tv')) {
      try {
        const response = await fetch(
          `${API_URL}/${mediaType}/${id}?api_key=${API_KEY}&language=fr-FR`,
          { next: { revalidate: 3600 } }
        );
        
        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }
        
        const data = await response.json();
        return NextResponse.json({
          ...data,
          media_type: mediaType
        });
      } catch (error) {
        console.error(`Erreur lors de la récupération du ${mediaType} avec ID ${id}:`, error);
        
        // Si le type spécifié échoue, essayer l'autre type
        const otherType = mediaType === 'movie' ? 'tv' : 'movie';
        const fallbackResponse = await fetch(
          `${API_URL}/${otherType}/${id}?api_key=${API_KEY}&language=fr-FR`,
          { next: { revalidate: 3600 } }
        );
        
        if (!fallbackResponse.ok) {
          return NextResponse.json(
            { error: `Média non trouvé avec l'ID: ${id}` },
            { status: 404 }
          );
        }
        
        const fallbackData = await fallbackResponse.json();
        return NextResponse.json({
          ...fallbackData,
          media_type: otherType
        });
      }
    }
    
    // Si aucun type n'est spécifié, essayer d'abord movie, puis tv
    try {
      const movieResponse = await fetch(
        `${API_URL}/movie/${id}?api_key=${API_KEY}&language=fr-FR`,
        { next: { revalidate: 3600 } }
      );
      
      if (movieResponse.ok) {
        const movieData = await movieResponse.json();
        return NextResponse.json({
          ...movieData,
          media_type: 'movie'
        });
      }
      
      const tvResponse = await fetch(
        `${API_URL}/tv/${id}?api_key=${API_KEY}&language=fr-FR`,
        { next: { revalidate: 3600 } }
      );
      
      if (!tvResponse.ok) {
        return NextResponse.json(
          { error: `Média non trouvé avec l'ID: ${id}` },
          { status: 404 }
        );
      }
      
      const tvData = await tvResponse.json();
      return NextResponse.json({
        ...tvData,
        media_type: 'tv'
      });
    } catch (error) {
      console.error('Error fetching media details:', error);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching media data:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
