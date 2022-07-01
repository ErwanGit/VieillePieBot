FROM node:18.4 as base
WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node tsconfig.json ./

RUN npm set-script prepare ""

FROM base as builder

RUN npm install --save-dev

COPY --chown=node:node ./src ./src
COPY --chown=node:node .env .

RUN npx tsc

FROM base as production

RUN npm ci

COPY --from=builder --chown=node:node /app/dist ./dist

ENV NODE_ENV=production

USER node

CMD node dist/index.js