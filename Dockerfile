ARG NODE_VERSION=20.13.1

FROM node:${NODE_VERSION}-slim AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

RUN yarn build

FROM builder AS production

ENV NODE_ENV=production

RUN npm prune --omit=dev \
    && npm cache clean --force \
    && mkdir -p /app/shared-tokens /home/logs \
    && chown -R node:node /app /home/logs

USER node

EXPOSE 3203

CMD ["node", "dist/index.js"]
