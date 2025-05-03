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
- **LocalStorage** - Pour la gestion des favoris et contenus visionnés côté client

## Fonctionnalités

- ✅ **Page d'accueil** avec carrousels des tendances, films et séries
- ✅ **Pages détaillées** pour les films et séries
- ✅ **Recherche** de films, séries et personnes
- ✅ **Catégories** : Films populaires, Films à l'affiche, Films les mieux notés, etc.
- ✅ **Pagination** responsive pour naviguer à travers les résultats
- ✅ **Gestion des favoris** avec sauvegarde dans localStorage
- ✅ **Suivi des contenus visionnés** avec marquage "déjà vu"
- ✅ **Mode responsive** adapté à tous les appareils
- ✅ **Mode sombre** pour une utilisation confortable de nuit
- ✅ **Accessibilité** avec navigation au clavier et attributs ARIA
- ✅ **Loading skeletons** pour améliorer l'UX pendant le chargement
- ✅ **Filtrage intelligent** pour exclure les contenus non pertinents

## Structure du projet

```bash
frontend/
├── app/                       # Pages de l'application (Next.js App Router)
│   ├── page.tsx               # Page d'accueil avec carrousels de contenu
│   ├── layout.tsx             # Layout principal avec navbar et footer 
│   ├── loading.tsx            # Composant de chargement global
│   ├── error.tsx              # Page d'erreur personnalisée
│   ├── movies/                # Pages des films (populaires, à l'affiche, etc.)
│   ├── series/                # Pages des séries populaires
│   ├── tv/                    # Pages spécifiques aux séries TV
│   ├── media/[id]/            # Page détaillée d'un média avec informations complètes
│   ├── person/[id]/           # Page détaillée d'une personne (acteur, réalisateur)
│   ├── search/                # Page de recherche avec filtres
│   ├── favorites/             # Page des favoris avec onglets : favoris, à voir, déjà vus
│   ├── login/                 # Page de connexion utilisateur
│   ├── register/              # Page d'inscription utilisateur
│   └── verify/                # Page de vérification d'email
├── components/                # Composants réutilisables
│   ├── HeroSection.tsx        # Section héro de la page d'accueil
│   ├── MediaCard.tsx          # Carte d'un film/série avec badges (favoris, à voir, vu)
│   ├── MediaDetailHeader.tsx  # En-tête détaillée pour la page d'un média
│   ├── MediaCardSkeleton.tsx  # Squelette de chargement pour MediaCard
│   ├── HorizontalCarousel.tsx # Carrousel horizontal pour les listes de médias
│   ├── Navbar.tsx             # Barre de navigation responsive avec recherche, dark mode, auth
│   ├── SearchBar.tsx          # Barre de recherche avec suggestions
│   ├── Pagination.tsx         # Composant de pagination pour les résultats
│   ├── ItemsPerPageSelector.tsx # Sélecteur pour le nombre d'éléments par page
│   ├── DarkModeToggle.tsx     # Bouton de basculement du mode sombre
│   ├── FavoriteButton.tsx     # Bouton pour ajouter/retirer des favoris
│   ├── WatchLaterButton.tsx   # Bouton "À voir" pour marquer les contenus à regarder plus tard
│   ├── MarkAsWatchedButton.tsx# Bouton "Déjà vu" pour marquer les contenus visionnés
│   ├── CastList.tsx           # Liste du casting avec photos et rôles
│   ├── GenreSelector.tsx      # Filtrage par genres pour films et séries
│   ├── StreamingProviders.tsx # Affichage des plateformes de streaming disponibles
│   └── StatusDot.tsx          # Indicateur visuel de statut (vu, à voir, etc.)
├── lib/                       # Fonctions utilitaires
│   ├── tmdb.ts                # Appels à l'API TMDB avec mise en cache
│   ├── favoritesService.ts    # Gestion du localStorage pour les favoris
│   ├── watchLaterItems.ts     # Gestion du localStorage pour les "à voir"
│   ├── watchedItems.ts        # Gestion du localStorage pour les "déjà vus"
│   ├── clientUtils.ts         # Fonctions client génériques (montage, localStorage)
│   ├── utils.ts               # Fonctions utilitaires générales
│   ├── authContext.tsx        # Context React pour la gestion de l'état d'authentification
│   ├── auth.ts                # Fonctions de validation/cryptage des mots de passe et tokens
│   ├── email.ts               # Fonction d'envoi d'email avec Nodemailer
│   └── prisma.ts              # Client Prisma pour les requêtes à la base de données
├── prisma/                    # Configuration de la base de données
│   └── schema.prisma          # Schéma de la base avec le modèle `User`
├── styles/                    # Fichiers de style globaux
│   └── globals.css            # TailwindCSS global et styles personnalisés
├── types/                     # Types TypeScript partagés
│   ├── tmdb.ts                # Types liés à l'API TMDB
│   └── auth.ts                # Types liés à l'authentification
├── middleware.ts              # Middleware Next.js pour la protection des routes
└── public/                    # Fichiers statiques (logos, favicons, images)
    └── images/                # Images utilisées dans l'application
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
