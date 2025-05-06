@echo off
ECHO Arrêt des conteneurs Docker...
docker-compose down

ECHO Suppression du volume de données PostgreSQL...
docker volume rm cinetech_2.0_postgres_data

ECHO Recréation des conteneurs...
docker-compose up -d

ECHO Attente que PostgreSQL soit prêt...
timeout /t 10 /nobreak

ECHO Application des migrations Prisma...
docker-compose exec backend npx prisma migrate reset --force

ECHO La base de données a été réinitialisée avec succès!
