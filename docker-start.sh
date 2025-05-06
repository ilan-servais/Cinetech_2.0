#!/bin/bash

# Check if .env exists, if not create it from .env.docker
if [ ! -f .env ]; then
  echo "Creating .env from .env.docker..."
  cp .env.docker .env
  echo "Please edit .env with your actual values before continuing"
  exit 1
fi

# Build and start all containers
echo "Starting Cinetech 2.0 with Docker..."
docker compose up --build
