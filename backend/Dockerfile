# backend/Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm install -g ts-node typescript

EXPOSE 8000

CMD ["npx", "--no-install", "ts-node", "--transpile-only", "src/server.ts"]