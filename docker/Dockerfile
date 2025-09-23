FROM node:22-alpine AS base

WORKDIR /app

RUN apk update && \
    apk upgrade && \
    apk add --no-cache wget ca-certificates build-base python3 fontconfig ttf-bitstream-vera dumb-init cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

ENV TZ Europe/Paris

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node ./src ./src
COPY --chown=node:node tsconfig.json ./

RUN npx tsc

COPY --chown=node:node .env .
COPY --chown=node:node ./src/assets ./dist/assets

CMD node dist/index.js