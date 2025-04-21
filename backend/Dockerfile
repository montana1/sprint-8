FROM node:16-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine AS runner

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

ENV NODE_ENV production
RUN npm ci --only=production

EXPOSE 3001
CMD ["node", "dist/main.js"]