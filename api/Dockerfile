# Build stage
FROM node:22.14.0

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start nginx
CMD ["node", "server.js"]