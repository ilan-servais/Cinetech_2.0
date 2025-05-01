# Cinetech 2.0

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![TMDB](https://img.shields.io/badge/TMDB-API-01B4E4?style=flat)

Application web inspirée de TMDB (The Movie Database) permettant d'explorer une vaste collection de films et séries, avec une interface moderne et responsive.

## À propos du projet

Cinetech 2.0 est une application web qui utilise l'API TMDB pour offrir une expérience de navigation fluide à travers les films et séries. L'application permet de consulter les tendances, les films à l'affiche, les séries populaires, d'effectuer des recherches et de gérer une liste de favoris.

## Stack technique

- **Next.js 14** (App Router) - Framework React moderne avec rendu côté serveur (SSR)
- **TypeScript** (mode strict) - Pour un typage fort et un code plus robuste
- **TailwindCSS** - Framework CSS utility-first pour un développement rapide
- **API TMDB** - Source de données pour les films, séries et artistes
- **LocalStorage** - Pour la gestion des favoris côté client

## Fonctionnalités

- ✅ **Page d'accueil** avec carrousels des tendances, films et séries
- ✅ **Pages détaillées** pour les films et séries
- ✅ **Recherche** de films, séries et personnes
- ✅ **Catégories** : Films populaires, Films à l'affiche, Films les mieux notés, etc.
- ✅ **Pagination** pour naviguer à travers les résultats
- ✅ **Gestion des favoris** avec sauvegarde dans localStorage
- ✅ **Mode responsive** adapté à tous les appareils
- ✅ **Accessibilité** avec navigation au clavier et attributs ARIA
- ✅ **Loading skeletons** pour améliorer l'UX pendant le chargement
- ✅ **Filtrage intelligent** pour exclure les contenus non pertinents

## Structure du projet

```bash
frontend/
├── app/                       # Pages de l'application (Next.js App Router)
│   ├── page.tsx               # Page d'accueil
│   ├── layout.tsx             # Layout principal avec navbar et footer
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
│   └── favoritesService.ts    # Service de gestion des favoris
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

```
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

## Fonctionnalités clés

- Parcourir les films et les émissions de télévision
- Authentification des utilisateurs
- Enregistrer des favoris
- Laisser des commentaires et des évaluations
