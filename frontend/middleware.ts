import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Définir les routes strictement protégées qui nécessitent une authentification
const strictlyProtectedRoutes = [
  '/profile', // Routes qui nécessitent toujours une redirection
  '/watchlist',
];

// Routes avec onboarding pour utilisateurs non connectés
const onboardingEnabledRoutes = [
  '/favorites', // Cette route affichera un onboarding au lieu de rediriger
];

export function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur a un token d'authentification dans les cookies
  const hasAuthToken = request.cookies.has('auth_token');
  
  // Vérifier si la route actuelle est strictement protégée
  const isStrictlyProtectedRoute = strictlyProtectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // Vérifier si la route supporte l'onboarding
  const isOnboardingEnabledRoute = onboardingEnabledRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // Si c'est une route strictement protégée et que l'utilisateur n'est pas authentifié,
  // rediriger vers la page de connexion
  if (isStrictlyProtectedRoute && !hasAuthToken) {
    // Construire l'URL de redirection avec l'URL d'origine comme paramètre de redirection
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // Pour les routes avec onboarding, permettre l'accès sans redirection
  // Le composant s'occupera d'afficher le contenu approprié
  
  // Sinon, continuer normalement
  return NextResponse.next();
}

// Configurer sur quelles routes le middleware doit s'exécuter
// Note: on continue de matcher /favorites pour l'inspection,
// mais on ne redirige plus automatiquement
export const config = {
  matcher: ['/favorites', '/profile', '/watchlist'],
};
