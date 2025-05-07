FROM node:18-alpine3.17

# Set working directory
WORKDIR /app

# Install system dependencies including OpenSSL for Prisma
RUN apk update && apk add --no-cache bash curl openssl python3 make g++ libc6-compat

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies including devDependencies to make sure ts-node-dev is available
RUN npm ci --include=dev

# Copy Prisma schema
COPY prisma ./prisma/

# Copy the rest of the application
COPY . .

# Generate Prisma client with production settings to ensure proper binary generation
ENV NODE_ENV=production
RUN npx prisma generate

# Create wait-for-it.sh script
RUN echo '#!/bin/bash\n\
# wait-for-it.sh script\n\
set -e\n\
host="$1"\n\
port="$2"\n\
shift 2\n\
cmd="$@"\n\
\n\
until nc -z "$host" "$port"; do\n\
  >&2 echo "Waiting for $host:$port..."\n\
  sleep 1\n\
done\n\
\n\
>&2 echo "$host:$port is available"\n\
\n\
if [ -n "$cmd" ]; then\n\
  >&2 echo "Running command: $cmd"\n\
  exec $cmd\n\
fi\n' > /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Copy and make our entrypoint script executable
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Command to run the application
CMD ["npm", "run", "dev"]
