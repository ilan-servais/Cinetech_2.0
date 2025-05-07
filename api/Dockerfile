FROM node:18-alpine3.17

# Set working directory
WORKDIR /app

# Install system dependencies including OpenSSL for Prisma
RUN apk update && apk add --no-cache bash curl openssl python3 make g++ libc6-compat

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci --include=dev

# Copy Prisma schema
COPY prisma ./prisma/

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application (if needed)
# You can skip this if you're only using ts-node-dev in dev mode
# RUN npm run build

# Expose backend port
EXPOSE 3001

# Start the app in development mode
CMD ["npm", "run", "dev"]
