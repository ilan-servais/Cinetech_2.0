#!/bin/sh

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
npm start
