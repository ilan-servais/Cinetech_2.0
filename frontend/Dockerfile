FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci

# Development build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set Next.js to development mode
ENV NODE_ENV=development

# Expose the port
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "run", "dev"]
