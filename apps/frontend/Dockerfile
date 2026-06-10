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
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json

RUN pnpm install --frozen-lockfile --filter frontend

FROM deps AS build

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY apps/frontend apps/frontend

RUN pnpm --filter frontend build

FROM nginx:stable-alpine AS runner

ENV BACKEND_URL=http://host.docker.internal:4000

COPY apps/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /workspace/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
