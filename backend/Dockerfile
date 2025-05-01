# Alpine image
FROM node:lts-alpine AS alpine

# Set working directory
WORKDIR /app
# Copy package.json and package-lock.json
COPY package.json pnpm-lock.yaml ./
# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
# Copy all files
COPY . .
# Build the app
RUN pnpm build
# Start the app
CMD node dist/main.js
# Expose the port
EXPOSE 8000