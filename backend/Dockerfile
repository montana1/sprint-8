FROM node:18

# Установка socat (для проброса localhost:8080 → keycloak:8080)
RUN apt-get update && apt-get install -y socat

# Рабочая директория
WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm install

# Установка инструментов разработки
RUN npm install -g ts-node nodemon

# Копируем проект
COPY . .

# Открываем порт
EXPOSE 8000

# Запускаем socat и nodemon одновременно
CMD socat TCP-LISTEN:8080,fork TCP:keycloak:8080 & \
    nodemon --watch src --ext ts --exec "ts-node src/server.ts"