FROM node:22-alpine AS base

WORKDIR /app

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        # node-gyp
        libstdc++ build-base python3 make g++ gcc pkgconfig \
        # Canvas (dev version)
        pixman-dev cairo-dev pango-dev libjpeg-turbo-dev giflib-dev librsvg-dev \
        # Canvas (runtime version)
        pixman cairo pango libjpeg-turbo giflib librsvg gcompat

ENV TZ Europe/Paris

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node ./src ./src
COPY --chown=node:node tsconfig.json ./

RUN npx tsc

COPY --chown=node:node .env .
COPY --chown=node:node ./src/assets ./dist/assets

CMD node dist/index.js