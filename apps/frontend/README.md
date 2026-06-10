# Sikdae Frontend

React + TypeScript frontend for browsing Sikdae stores. It includes store search, category and supply filters, location-based recommendations, detail views, and Leaflet map UI.

## Stack

- Vite+ and Vite
- React 19
- TanStack Query
- Axios
- Tailwind CSS
- Radix UI, shadcn configuration, and Lucide icons
- Leaflet

## Development

From the repository root:

```bash
vp run dev:frontend
```

`vp run dev` also starts the frontend.

The Vite dev server proxies `/api` to `http://127.0.0.1:4000`, so start the backend separately when using live API data:

```bash
vp run dev:backend
```

To point the client at a different API URL, set:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

If `VITE_API_BASE_URL` is not set, the frontend uses `/api`.

## Scripts

Run from the repository root:

```bash
vp run frontend#dev
vp run frontend#build
vp run frontend#preview
```

Project-wide validation:

```bash
vp check
vp test
vp run -r build
```

## Docker

Build the frontend image from the repository root:

```bash
docker build -f apps/frontend/Dockerfile -t sikdae-frontend .
```

Run the frontend container:

```bash
docker run --rm -p 8080:80 sikdae-frontend
```

The image serves the built frontend with nginx. `/api` requests are proxied to `http://host.docker.internal:4000` by default, which is convenient when the backend runs on the host machine.

Override the backend URL at runtime:

```bash
docker run --rm -p 8080:80 -e BACKEND_URL=http://backend-host:4000 sikdae-frontend
```

If you want the built client to call a different base URL instead of `/api`, pass a build argument:

```bash
docker build \
  -f apps/frontend/Dockerfile \
  --build-arg VITE_API_BASE_URL=https://example.com \
  -t sikdae-frontend .
```

## Source Layout

```text
src/
  features/stores/  Store discovery feature
  components/ui/    Shared UI primitives
  lib/api/          Axios API client
  lib/query/        TanStack Query client
```
