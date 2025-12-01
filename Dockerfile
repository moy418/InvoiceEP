FROM node:18-alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY server.js ./
COPY public ./public

# Create data directory
RUN mkdir -p /data

EXPOSE 3000

CMD ["node", "server.js"]
