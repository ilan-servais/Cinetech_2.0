@echo off
echo Checking for .env file...

if not exist .env (
  echo Creating .env from .env.docker...
  copy .env.docker .env
  echo Please edit .env with your actual values before continuing
  pause
  exit /b
)

echo Starting Cinetech 2.0 with Docker...
docker compose up --build
