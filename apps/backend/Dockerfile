# syntax=docker/dockerfile:1

FROM node:22-slim AS deps

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /workspace

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@11.5.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json vite.config.ts ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

RUN pnpm install --frozen-lockfile --filter backend

FROM deps AS build

COPY apps/backend apps/backend

RUN pnpm --filter backend build

FROM node:22-slim AS prod-deps

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@11.5.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

RUN pnpm install --frozen-lockfile --prod --filter backend --ignore-scripts

FROM node:22-slim AS runner

ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app

COPY --from=prod-deps /workspace/node_modules ./node_modules
COPY --from=prod-deps /workspace/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=prod-deps /workspace/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /workspace/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["node", "dist/main.js"]
