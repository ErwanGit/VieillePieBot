FROM node:18.17-buster-slim as base

WORKDIR /app

ENV TZ Europe/Paris

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node ./src ./src
COPY --chown=node:node tsconfig.json ./

RUN npx tsc

COPY --chown=node:node .env .

CMD node dist/index.js
