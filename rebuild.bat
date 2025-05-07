@echo off
echo 🛑 Arrêt des conteneurs et suppression des volumes...
docker-compose down --volumes

echo 🔄 Reconstruction complète des services sans cache...
docker-compose build --no-cache

echo 🚀 Démarrage des services en arrière-plan...
docker-compose up -d

echo 📦 État des conteneurs :
docker ps

echo 📋 Logs du backend :
docker logs cinetech_backend
pause
