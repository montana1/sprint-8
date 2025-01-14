FROM node
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build
CMD ["yarn", "run", "start"]
