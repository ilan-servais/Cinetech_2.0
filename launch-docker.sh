#!/bin/bash

# Exportation des variables d'environnement depuis .env.docker
export $(grep -v '^#' .env.docker | xargs)

# Affichage des variables (masquage des valeurs sensibles)
echo "✅ Variables d'environnement chargées:"
echo "- DATABASE_URL: [Défini]"
echo "- POSTGRES_USER: $POSTGRES_USER"
echo "- POSTGRES_DB: $POSTGRES_DB"
echo "- JWT_SECRET: [Défini]"
echo "- FRONTEND_URL: $FRONTEND_URL"
echo "- TMDB_API_KEY: [Défini]"
echo "- EMAIL_FROM: $EMAIL_FROM"

# Arrêt et suppression des conteneurs existants
echo "🧹 Nettoyage des conteneurs précédents..."
docker compose down -v

# Reconstruction des conteneurs
echo "🔨 Reconstruction des conteneurs..."
docker compose up --build -d

# Affichage des logs du backend
echo "📋 Affichage des logs du backend (Ctrl+C pour quitter):"
docker logs cinetech_backend -f
