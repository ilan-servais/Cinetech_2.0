# Docker Setup for Cinetech 2.0

Ce guide explique comment lancer l'application Cinetech 2.0 en utilisant Docker.

## Prérequis

- Docker et Docker Compose installés sur votre machine
- Un fichier `.env.docker` correctement configuré (voir instructions ci-dessous)

## Configuration

1. Assurez-vous que le fichier `.env.docker` à la racine du projet contient les variables d'environnement suivantes :

```
# Database configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cinetech

# JWT Secret (for authentication)
JWT_SECRET=your_very_secure_jwt_secret

# Frontend configuration
FRONTEND_URL=http://localhost:3000

# TMDB API Key (required for movie data)
TMDB_API_KEY=your_tmdb_api_key_here

# Email configuration
EMAIL_FROM=no-reply@cinetech.local
```

2. Remplacez `your_tmdb_api_key_here` par votre clé API TMDB.
3. Pour la production, modifiez le `JWT_SECRET` avec une valeur sécurisée.

## Lancement de l'application

### Premier démarrage (construction des images)

```bash
# Copier le fichier d'environnement
cp .env.docker .env

# Construire et démarrer les conteneurs
docker compose up --build
```

### Démarrages suivants

```bash
docker compose up
```

### Démarrage en mode détaché (arrière-plan)

```bash
docker compose up -d
```

## Accès aux services

Une fois les conteneurs démarrés, vous pouvez accéder aux services suivants :

- **Frontend (Next.js)** : http://localhost:3000
- **Backend API (Express)** : http://localhost:3001
- **Interface Mailhog** : http://localhost:8025
- **Base de données PostgreSQL** : port 5432 (accessible via un client PostgreSQL)

## Exécution des commandes Prisma

Pour exécuter des commandes Prisma (comme les migrations), vous pouvez utiliser :

```bash
# Lancer une commande dans le conteneur backend
docker compose exec backend npx prisma migrate dev
```

## Arrêt des conteneurs

```bash
docker compose down
```

Pour arrêter les conteneurs et supprimer les volumes (perte des données) :

```bash
docker compose down -v
```

## En cas de problème

### Logs des conteneurs

Pour voir les logs d'un conteneur spécifique :

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f mailhog
```

### Redémarrage d'un conteneur spécifique

```bash
docker compose restart backend
```

### Reconstruction complète

Si vous rencontrez des problèmes persistants, essayez une reconstruction complète :

```bash
docker compose down -v
docker compose up --build
```
