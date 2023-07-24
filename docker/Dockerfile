FROM node:18.17-buster-slim as base

WORKDIR /app

RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends wget ca-certificates build-essential python3 fontconfig ttf-bitstream-vera dumb-init

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV TZ Europe/Paris

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node ./src ./src
COPY --chown=node:node tsconfig.json ./

RUN npx tsc

COPY --chown=node:node .env .
COPY --chown=node:node ./src/assets ./dist/assets

CMD node dist/index.js
