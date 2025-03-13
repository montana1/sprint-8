# Используем официальную версию Node.js LTS
FROM node:20-alpine

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Выполняем сборку проекта
RUN npm run build

# Порт, на котором работает приложение
EXPOSE 8000

# Запускаем сервер
CMD ["npm", "start"]