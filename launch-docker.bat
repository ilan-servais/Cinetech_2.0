@echo off
echo Loading environment variables from .env.docker...

:: Vérification de la présence du fichier .env.docker
if not exist .env.docker (
    echo Erreur: Fichier .env.docker non trouve!
    exit /b 1
)

:: Arrêt et suppression des conteneurs existants
echo Nettoyage des conteneurs precedents...
docker compose down -v

:: Définition des variables d'environnement pour Docker
echo Reconstruction des conteneurs avec les variables d'environnement...
set "DATABASE_URL="
for /F "tokens=*" %%i in ('type .env.docker ^| findstr /v "^#" ^| findstr "DATABASE_URL"') do set %%i

set "JWT_SECRET="
for /F "tokens=*" %%i in ('type .env.docker ^| findstr /v "^#" ^| findstr "JWT_SECRET"') do set %%i

set "FRONTEND_URL="
for /F "tokens=*" %%i in ('type .env.docker ^| findstr /v "^#" ^| findstr "FRONTEND_URL"') do set %%i

set "TMDB_API_KEY="
for /F "tokens=*" %%i in ('type .env.docker ^| findstr /v "^#" ^| findstr "TMDB_API_KEY"') do set %%i

set "EMAIL_FROM="
for /F "tokens=*" %%i in ('type .env.docker ^| findstr /v "^#" ^| findstr "EMAIL_FROM"') do set %%i

set "POSTGRES_USER="
for /F "tokens=*" %%i in ('type .env.docker ^| findstr /v "^#" ^| findstr "POSTGRES_USER"') do set %%i

set "POSTGRES_PASSWORD="
for /F "tokens=*" %%i in ('type .env.docker ^| findstr /v "^#" ^| findstr "POSTGRES_PASSWORD"') do set %%i

set "POSTGRES_DB="
for /F "tokens=*" %%i in ('type .env.docker ^| findstr /v "^#" ^| findstr "POSTGRES_DB"') do set %%i

:: Lancement des conteneurs
docker compose up --build -d

:: Affichage des logs du backend
echo Affichage des logs du backend (Ctrl+C pour quitter):
docker logs cinetech_backend -f
