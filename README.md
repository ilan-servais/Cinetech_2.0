# Cinetech 2.0

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![TMDB](https://img.shields.io/badge/TMDB-API-01B4E4?style=flat)

Application web inspirée de TMDB (The Movie Database) permettant d'explorer une vaste collection de films et séries, avec une interface moderne et responsive.

## À propos du projet

Cinetech 2.0 est une application web qui utilise l'API TMDB pour offrir une expérience de navigation fluide à travers les films et séries. L'application permet de consulter les tendances, les films à l'affiche, les séries populaires, d'effectuer des recherches et de gérer une liste de favoris ainsi que des contenus visionnés.

## Stack technique

- **Next.js 14** (App Router) - Framework React moderne avec rendu côté serveur (SSR)
- **TypeScript** (mode strict) - Pour un typage fort et un code plus robuste
- **TailwindCSS** - Framework CSS utility-first pour un développement rapide
- **API TMDB** - Source de données pour les films, séries et artistes
- **PostgreSQL** - Base de données pour stocker les utilisateurs et leurs préférences
- **Prisma** - ORM pour interagir avec la base de données

## Fonctionnalités

- ✅ **Page d'accueil** avec carrousels des tendances, films et séries
- ✅ **Pages détaillées** pour les films et séries
- ✅ **Recherche** de films, séries et personnes
- ✅ **Catégories** : Films populaires, Films à l'affiche, Films les mieux notés, etc.
- ✅ **Pagination** responsive pour naviguer à travers les résultats
- ✅ **Gestion des favoris** avec sauvegarde dans la base de données
- ✅ **Suivi des contenus visionnés** avec marquage "déjà vu"
- ✅ **Liste à voir plus tard** pour marquer les contenus à regarder
- ✅ **Mode responsive** adapté à tous les appareils
- ✅ **Mode sombre** pour une utilisation confortable de nuit
- ✅ **Accessibilité** avec navigation au clavier et attributs ARIA
- ✅ **Loading skeletons** pour améliorer l'UX pendant le chargement
- ✅ **Filtrage intelligent** pour exclure les contenus non pertinents

## Structure du projet

```bash
frontend/
├── app/                       # Pages de l'application (Next.js App Router)
│   ├── page.tsx               # Page d'accueil
│   ├── layout.tsx             # Layout principal avec navbar etfooter 
│   ├── loading.tsx            # Composant de chargement global
│   ├── movies/                # Pages des films
│   ├── series/                # Pages des séries
│   ├── tv/                    # Pages spécifiques aux séries TV
│   ├── media/[id]/            # Page détaillée d'un média
│   ├── search/                # Page de recherche
│   └── favorites/             # Page des favoris
├── components/                # Composants réutilisables
│   ├── HeroSection.tsx        # Section héro de la page d'accueil
│   ├── MediaCard.tsx          # Carte d'un film/série
│   ├── MediaCardSkeleton.tsx  # Squelette de chargement pour MediaCard
│   ├── HorizontalCarousel.tsx # Carrousel horizontal
│   ├── Navbar.tsx             # Barre de navigation
│   ├── SearchBar.tsx          # Barre de recherche
│   ├── FavoriteButton.tsx     # Bouton pour ajouter/retirer des favoris
│   └── CastList.tsx           # Liste du casting
├── lib/                       # Fonctions utilitaires
│   ├── tmdb.ts                # Intégration avec l'API TMDB
│   ├── favoritesService.ts    # Service de gestion des favoris
│   ├── watchedItems.ts        # Service de gestion des contenus visionnés
│   └── watchLaterItems.ts   # Service de gestion des contenus à voir plus tard
├── styles/                    # Styles globaux
│   └── globals.css            # CSS global avec Tailwind
├── types/                     # Types TypeScript
│   └── tmdb.ts                # Types pour l'API TMDB
└── public/                    # Fichiers statiques
```

## Installation

### Prérequis

- Node.js 18.x ou supérieur
- npm ou yarn
- PostgreSQL

### Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/cinetech-2.0.git

# Se placer dans le dossier du projet
cd cinetech-2.0/frontend

# Installer les dépendances
npm install

# Copier le fichier d'exemple des variables d'environnement
cp .env.local.example .env.local

# Remplir les variables d'environnement nécessaires dans .env.local
```

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet frontend et ajoutez les variables suivantes:

```bash
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

Remplacez `your_api_key_here` par votre clé API TMDB. Vous pouvez obtenir une clé API en créant un compte sur [https://www.themoviedb.org/](https://www.themoviedb.org/)

## Démarrage

Pour démarrer l'application en mode développement:

```bash
npm run dev
```

Cela lancera le serveur de développement et vous pourrez accéder à l'application à l'adresse [http://localhost:3000](http://localhost:3000)

## Déploiement

Pour déployer l'application, vous pouvez utiliser des services comme Vercel, Netlify ou Heroku. Assurez-vous de configurer les variables d'environnement nécessaires sur la plateforme de déploiement choisie.

## Architecture de l'authentification

Cinetech 2.0 implémente une architecture d'authentification moderne et optimisée basée sur les meilleures pratiques React/Next.js.

### Choix architectural : Provider unique au niveau racine

L'authentification est gérée par un **AuthProvider unique** monté dans `app/layout.tsx`, garantissant :
- ✅ Une seule source de vérité pour l'état d'authentification
- ✅ Prévention des fuites mémoire et des états incohérents
- ✅ Performance optimale avec un seul appel d'initialisation

```tsx
// app/layout.tsx
<AuthProvider>
  <ClientLayout>{children}</ClientLayout>
</AuthProvider>
```

### Pattern centralisé avec fetch unique

Le contexte AuthContext centralise **tous** les appels d'authentification :
- 🎯 **Un seul fetch** `/api/auth/me` dans toute l'application
- 🎯 **Pas de duplicatas** dans les composants individuels
- 🎯 **Gestion d'état unifiée** (loading, initialized, user)

```tsx
// contexts/AuthContext.tsx
const fetchCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  // Traitement centralisé...
};
```

### Hook useAuth pour tous les composants

Tous les composants utilisent exclusivement le hook `useAuth()` :
- ✅ Accès uniforme à l'état d'authentification
- ✅ Évite les fetches directs dans les composants
- ✅ Type safety avec TypeScript

```tsx
// Dans n'importe quel composant
const { user, loading, initialized, isAuthenticated } = useAuth();

if (!hasMounted || !initialized || loading) {
  return <LoadingSpinner />;
}
```

### Redirection sécurisée

La logique de redirection respecte le cycle de vie Next.js :
1. ⏳ **Attendre le montage côté client** (`hasMounted`)
2. ⏳ **Attendre l'initialisation du contexte** (`initialized`)
3. ⏳ **Attendre la fin du loading** (`!loading`)
4. 🚨 **Rediriger seulement si non authentifié**

```tsx
// Pattern de redirection sécurisée
if (hasMounted && initialized && !loading && !isAuthenticated) {
  router.push('/login');
  return;
}
```

### Composant AuthGuard

Un composant réutilisable `AuthGuard` encapsule cette logique :

```tsx
<AuthGuard fallback={<LoginPrompt />}>
  <ProtectedContent />
</AuthGuard>
```

### Avantages de cette architecture

- 🚀 **Performance** : Un seul appel réseau pour l'authentification
- 🛡️ **Sécurité** : Redirections conditionnelles robustes
- 🧹 **Maintenabilité** : Code DRY avec une logique centralisée
- 🔧 **Debugging** : Logs structurés pour tracer les états
- 💾 **État consistant** : Synchronisation automatique dans toute l'app

### Recommandations pour l'amélioration

Pour étendre ce système, considérez :

1. **Refresh Token automatique** :
   ```tsx
   // Intercepteur pour renouveler le token expiré
   const refreshToken = async () => { /* ... */ };
   ```

2. **Gestion de session avancée** :
   ```tsx
   // Détection d'inactivité et logout automatique
   const useSessionTimeout = (minutes: number) => { /* ... */ };
   ```

3. **Tests End-to-End** :
   ```typescript
   // Cypress/Playwright pour tester les flux d'authentification
   cy.login('user@example.com', 'password');
   cy.should('be.redirected', '/dashboard');
   ```

4. **Monitoring et analytics** :
   ```tsx
   // Tracking des événements d'authentification
   analytics.track('user_login', { method: 'email' });
   ```

Cette architecture garantit une base solide et extensible pour l'authentification dans une application Next.js moderne.

## Fonctionnalités clés

- Parcourir les films et les émissions de télévision
- Authentification des utilisateurs
- Enregistrer des favoris
- Laisser des commentaires et des évaluations

## Migrations Prisma avec Docker

Pour exécuter des migrations Prisma dans l'environnement Docker:

1. Assurez-vous que vos conteneurs Docker sont en cours d'exécution:
```bash
docker-compose up -d
```

2. Rendez le script de migration exécutable (uniquement la première fois):
```bash
chmod +x ./scripts/prisma-migrate.sh
```

3. Exécutez une migration avec:
```bash
./scripts/prisma-migrate.sh nom_de_votre_migration
```
Par exemple: `./scripts/prisma-migrate.sh add_user_status`

4. Pour visualiser votre base de données après la migration:
```bash
docker-compose exec backend npx prisma studio
```
Puis accédez à http://localhost:5555 dans votre navigateur.

## Autres commandes utiles

- Générer le client Prisma:
```bash
docker-compose exec backend npx prisma generate
```

- Réinitialiser la base de données (⚠️ supprime toutes les données):
```bash
docker-compose exec backend npx prisma migrate reset --force
```
