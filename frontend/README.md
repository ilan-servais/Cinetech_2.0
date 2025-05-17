# Cinetech Frontend

## Architecture

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS pour le styling
- Stockage en base de données via Prisma + PostgreSQL pour les préférences utilisateur
- API REST pour communiquer avec le backend
- Authentification via JWT (stored in HTTPOnly cookies)

## Fonctionnalités

- Recherche de films et séries
- Affichage des détails (synopsis, casting, recommandations, etc.)
- Gestion des favoris
- Marquer comme "déjà vu"
- Liste "à voir plus tard"
- Mode sombre / clair
- Responsive design
- Filtres par genre
- Authentification utilisateur
- Profil utilisateur

## Développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_TMDB_API_KEY=votre_clé_api_tmdb
```

## Déploiement

```bash
npm run build
npm start
```
