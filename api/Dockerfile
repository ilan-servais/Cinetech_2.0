FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk update && apk add --no-cache bash curl

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies 
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

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

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "dev"]
