FROM node:18 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate
WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app
COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --chown=node:node prisma ./prisma

FROM base AS dev-deps
RUN pnpm fetch && pnpm install -r --offline
RUN pnpm prisma generate

FROM base AS prod-deps
ENV NODE_ENV=production
COPY --chown=node:node .husky ./.husky
RUN pnpm fetch --prod && pnpm install -r --offline --prod
RUN pnpm prisma generate

FROM base AS dev
COPY --chown=node:node --from=dev-deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
USER node

FROM base AS build
COPY --chown=node:node --from=dev-deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN pnpm build
USER node

FROM base AS release
ENV NODE_ENV=production
COPY --chown=node:node --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
USER node
CMD ["node", "dist/main.js"]
