FROM node:20-alpine as build

WORKDIR /app

COPY /package*.json .

RUN npm ci

COPY /src .
COPY /tsconfig.json .

RUN npx nest build
RUN npm ci --omit=dev

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/main.js"]