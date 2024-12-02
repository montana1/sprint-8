FROM dh-mirror.gitverse.ru/node:20-slim
WORKDIR /app
COPY . .
RUN npm ci
EXPOSE 80
ENTRYPOINT ["npm", "start"]
