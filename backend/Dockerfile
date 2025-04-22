FROM node:16-alpine

WORKDIR /usr/src/app

# Устанавливаем системные зависимости (включая curl)
RUN apk add --no-cache curl

# Устанавливаем node зависимости
COPY package*.json ./
RUN npm install

# Копируем исходники
COPY . .

# Для дебаггера и hot-reload
RUN npm install --save-dev @nestjs/cli

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Оставьте вашу текущую команду запуска (если есть)
# Например:
CMD ["node", "dist/main.js"]
