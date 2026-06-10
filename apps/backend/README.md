# Sikdae Backend

NestJS backend for the Sikdae education-purpose app. It wraps upstream Sikdae OAuth and store APIs, exposes normalized store endpoints for the frontend, and caches repeated responses through Redis when available.

## Stack

- NestJS
- Swagger/OpenAPI
- Axios through `@nestjs/axios`
- Joi environment validation
- Redis-compatible cache via `ioredis`

## Development

From the repository root:

```bash
vp run dev:backend
```

The server listens on `http://localhost:4000` by default.

Useful local URLs:

- `http://localhost:4000/health`
- `http://localhost:4000/status`
- `http://localhost:4000/docs`
- `http://localhost:4000/stores`

## Environment

Create or update `apps/backend/.env` with local credentials. Do not commit real secrets.

Required:

```bash
SIKDAE_OAUTH_BASE_URL=
SIKDAE_SIGN_ID=
SIKDAE_PASSWORD=
SIKDAE_CLIENT_ID=
SIKDAE_CLIENT_SECRET=
SIKDAE_KMS_KEY_ID=
SIKDAE_X_USER_AGENT=
```

Optional:

```bash
PORT=4000
REDIS_URL=redis://127.0.0.1:6379
SIKDAE_API_BASE_URL=https://api.sikdae.com
```

Use `apps/backend/.env.example` as the local template.

## Scripts

Run from the repository root:

```bash
vp run backend#dev
vp run backend#build
vp run backend#start
```

Project-wide validation:

```bash
vp check
vp test
vp run -r build
```

## Docker

Build the backend image from the repository root:

```bash
docker build -f apps/backend/Dockerfile -t sikdae-backend .
```

Run the backend container with the local `.env` file mounted into the app:

```bash
docker run --rm \
  -v "$PWD/apps/backend/.env:/app/apps/backend/.env:ro" \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -p 4000:4000 \
  sikdae-backend
```

The container listens on port `4000` unless `PORT` is overridden. Mounting the file lets Nest parse `.env` with dotenv semantics, including quoted values.

## Source Layout

```text
src/
  app/      Root response DTOs
  cache/    Cache service and interfaces
  config/   Environment validation and config factories
  sikdae/   Upstream Sikdae OAuth integration
  store/    Store API controllers, DTOs, mapping, and services
```
