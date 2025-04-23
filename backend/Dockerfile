FROM node:16-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache curl

RUN mkdir -p /usr/src/app/dist && \
    chown -R node:node /usr/src/app

COPY --chown=node:node package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3001
CMD ["npm", "run", "start:dev"]