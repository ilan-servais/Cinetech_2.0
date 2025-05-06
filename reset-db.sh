#!/bin/bash

# Arrêter les conteneurs Docker
echo "Arrêt des conteneurs Docker..."
docker-compose down

# Supprimer le volume de données PostgreSQL
echo "Suppression du volume de données PostgreSQL..."
docker volume rm cinetech_2.0_postgres_data

# Recréer les conteneurs
echo "Recréation des conteneurs..."
docker-compose up -d

# Attendre que PostgreSQL soit prêt
echo "Attente que PostgreSQL soit prêt..."
sleep 10

# Appliquer les migrations Prisma
echo "Application des migrations Prisma..."
docker-compose exec backend npx prisma migrate reset --force

echo "La base de données a été réinitialisée avec succès!"
