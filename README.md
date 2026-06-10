# Sikdae

Sikdae is a Vite+ monorepo for experimenting with a food-store discovery app. This repository is for education purpose and is not intended to be treated as a production deployment template.

## Apps

- `apps/frontend`: React + TypeScript client for store search, filters, recommendations, and map-based discovery.
- `apps/backend`: NestJS API service that proxies Sikdae store data, manages upstream authentication, caches responses, and exposes Swagger docs.

## Requirements

- Node.js `>=22.12.0`
- Vite+ global CLI: `vp`

## Setup

Install workspace dependencies after cloning or pulling remote changes:

```bash
vp install
```

The backend needs local environment variables for Sikdae OAuth and API access. See `apps/backend/README.md` for the required keys.

## Development

Run the frontend:

```bash
vp run dev
```

Run the backend:

```bash
vp run dev:backend
```

By default:

- Frontend runs through Vite+ and proxies `/api` requests to the backend.
- Backend listens on `http://localhost:4000`.
- Backend Swagger docs are available at `http://localhost:4000/docs`.

## Validation

Run the main project checks:

```bash
vp check
vp test
vp run -r build
```

Run the full ready check:

```bash
vp run ready
```

## Workspace

```text
apps/
  frontend/  React client
  backend/   NestJS API service
```

## Docker

Dockerfiles are defined per app:

- `apps/frontend/Dockerfile`
- `apps/backend/Dockerfile`

See each app README for image build and container run commands.
