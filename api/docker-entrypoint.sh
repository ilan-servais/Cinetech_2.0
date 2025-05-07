#!/bin/sh
set -e

# Affichage des informations de configuration
echo "🚀 Starting API initialization..."
echo "📊 Environment information:"
echo "- DATABASE_URL exists: $(if [ -n "$DATABASE_URL" ]; then echo "yes"; else echo "no"; fi)"
echo "- TMDB_API_KEY exists: $(if [ -n "$TMDB_API_KEY" ]; then echo "yes"; else echo "no"; fi)"
echo "- NODE_ENV: $NODE_ENV"

# Remove environment variables that might cause conflicts
unset PRISMA_QUERY_ENGINE_LIBRARY
unset PRISMA_SCHEMA_ENGINE_BINARY 
unset PRISMA_QUERY_ENGINE_BINARY

# Attente de la disponibilité de PostgreSQL
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=30
until nc -z postgres 5432 || [ $timeout -le 0 ]
do
  echo "⏳ Waiting for PostgreSQL ($timeout seconds left)..."
  sleep 1
  timeout=$((timeout-1))
done

if [ $timeout -le 0 ]; then
  echo "❌ Error: PostgreSQL did not start in time"
  exit 1
fi
echo "✅ PostgreSQL is up and running!"

# Exécution des migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Régénération forcée du client Prisma
echo "🔄 Regenerating Prisma client..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
NODE_ENV=production npx prisma generate

# Démarrage de l'application
echo "🚀 Starting application..."
exec "$@"
