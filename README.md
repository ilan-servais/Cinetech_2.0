# Cinetech 2.0

![Cinetech 2.0](https://via.placeholder.com/1200x630?text=Cinetech+2.0)

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

## Structure du projet

```bash
.
├── frontend              # Code de l'application Next.js
│   ├── public            # Fichiers statiques
│   ├── src               # Code source de l'application
│   │   ├── app           # Routes et composants de l'application
│   │   ├── components     # Composants réutilisables
│   │   ├── lib            # Fonctions utilitaires et API
│   │   ├── styles         # Fichiers CSS et Tailwind
│   │   └── ...            # Autres dossiers et fichiers
│   ├── .env.local        # Variables d'environnement locales
│   ├── next.config.js    # Configuration de Next.js
│   └── package.json      # Dépendances et scripts npm
└── api                   # Code de l'API backend
    ├── prisma            # Modèles et migrations Prisma
    ├── src               # Code source de l'API
    │   ├── routes        # Routes de l'API
    │   ├── controllers   # Logique des contrôleurs
    │   ├── middleware     # Middleware pour l'API
    │   └── ...            # Autres dossiers et fichiers
    ├── .env              # Variables d'environnement pour l'API
    ├── package.json      # Dépendances et scripts npm pour l'API
    └── tsconfig.json     # Configuration TypeScript pour l'API
```

## Instructions de configuration

### Option 1: Configuration manuelle (Recommandée)

1. **Configuration du frontend**:
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install
npm run dev
```

Si vous rencontrez des conflits lors de l'exécution de `npx create-next-app@latest . --typescript`, cela signifie que les fichiers Next.js sont déjà configurés.

2. **Configuration du backend**:
```bash
cd api
npm init -y  # Si package.json n'existe pas encore
npm install typescript ts-node-dev prisma @prisma/client express zod bcrypt jsonwebtoken cors
npm install -D @types/node @types/express @types/bcrypt @types/cors @types/jsonwebtoken
```

3. **Configuration de la base de données**:
- SQLite (Par défaut pour le développement):
```bash
cd api
# Assurez-vous que .env contient: DATABASE_URL="file:./dev.db"
npx prisma migrate dev --name init
npx prisma generate
```
- PostgreSQL (Optionnel):
   - Mettez à jour `.env` avec votre chaîne de connexion PostgreSQL
   - Exemple: `DATABASE_URL="postgresql://user:password@localhost:5432/cinetech?schema=public"`
   - Assurez-vous que PostgreSQL fonctionne sur localhost:5432

4. **Configuration des clés API**:
   - Créez un fichier `.env.local` dans le répertoire `frontend`
   - Ajoutez votre clé API TMDB: `NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here`
   - Vous pouvez obtenir une clé API en créant un compte sur [https://www.themoviedb.org/](https://www.themoviedb.org/)

5. **Démarrage des serveurs**:
- Frontend: `cd frontend && npm run dev` (accessible à http://localhost:3000)
- Backend: `cd api && npm run dev` (accessible à http://localhost:3001)

### Dépannage

- **Problèmes de connexion PostgreSQL**: Si vous voyez `Error: P1001: Can't reach database server`, assurez-vous que votre serveur PostgreSQL est en cours d'exécution ou passez à SQLite pour le développement.
- **Dossier Prisma existe**: Si vous voyez `ERROR A folder called prisma already exists in your project`, vous pouvez ignorer `npx prisma init` et exécuter directement les migrations.
- **Conflits de configuration Next.js**: Si vous voyez des conflits de fichiers lors de l'exécution de `create-next-app`, le projet Next.js est déjà configuré. Ignorez cette étape et procédez à l'installation des dépendances.

## Vérification

Après la configuration, vous devriez pouvoir accéder à:
- Frontend: http://localhost:3000 - Affiche la page d'accueil de Cinetech 2.0
- Backend: http://localhost:3001 - Renvoie une réponse JSON confirmant que l'API fonctionne

## Fonctionnalités clés

- Parcourir les films et les émissions de télévision
- Authentification des utilisateurs
- Enregistrer des favoris
- Laisser des commentaires et des évaluations
