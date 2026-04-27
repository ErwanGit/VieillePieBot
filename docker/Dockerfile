ARG ALPINE_VERSION=3.22

########
# Base #
########

FROM node:22.21-alpine${ALPINE_VERSION} AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

ENV TZ=Europe/Paris

WORKDIR /app

RUN apk add --no-cache \
    # to run as PID 1
    dumb-init \
    # node-gyp
    libstdc++ build-base python3 make g++ gcc pkgconfig \
    # Canvas (dev version)
    pixman-dev cairo-dev pango-dev libjpeg-turbo-dev giflib-dev librsvg-dev \
    # Canvas (runtime version)
    pixman cairo pango libjpeg-turbo giflib librsvg gcompat

COPY package.json pnpm-lock.yaml ./

ENTRYPOINT ["dumb-init", "--"]

###########
# Builder #
###########

FROM base AS builder

ENV NODE_ENV="development"

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY ./src ./src

RUN pnpm exec tsc

COPY ./src/assets ./dist/assets

###########################
# Production dependencies #
###########################

FROM base AS prod-deps

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

##############
# Production #
##############

FROM base AS production

ENV NODE_ENV="production"

COPY --from=builder /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
COPY .env ./

CMD ["node", "dist/index.js"]
