# docker-aws-deployment

A URL shortener: create short links, store them in Postgres, and get redirected when visiting the short URL.

## Structure

- `apps/api/` — Express API server (short-link CRUD + redirects, Postgres via `pg`)
- `apps/web/` — Next.js frontend (create links, list them, copy short URLs)
- `packages/shared/` — Shared TypeScript types used across all apps

pnpm + Turborepo monorepo. Conventions live in `AGENTS.md`.

## Run with Docker

```sh
docker compose up --build
```

Starts Postgres, waits for it to be healthy, starts the API (port 4000), waits for `/health` to return ok, then starts the web app (port 3000). Each app has its own multi-stage `Dockerfile` (`apps/api/Dockerfile`, `apps/web/Dockerfile`), built from the repo root.

## Local development

1. Copy `apps/api/.env.example` to `apps/api/.env` and `apps/web/.env.example` to `apps/web/.env` (defaults work out of the box)
2. `pnpm install`
3. `docker compose up -d postgres`
4. `pnpm dev` — web on http://localhost:3000, API on http://localhost:4000

The API runs migrations (creates the `links` table) automatically on startup. The database is configured via `DATABASE_URL` (default: `postgres://shortlinks:shortlinks@localhost:5432/shortlinks`).

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/links` | Create a short link. Body: `{ "url": "https://…", "code": "optional-custom-code" }` |
| `GET` | `/api/links` | List all links, newest first |
| `GET` | `/:code` | 302-redirect to the target URL and increment the click count |
| `GET` | `/health` | Health check |

Responses use the `ApiResponse<T>` envelope from `packages/shared`: `{ ok: true, data }` or `{ ok: false, error }`. Codes are 7 random base62 characters unless a custom code (3–32 chars, `[A-Za-z0-9_-]`) is given.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps concurrently |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Type-check all packages |
| `pnpm check` / `pnpm format` | Lint / auto-fix with Biome |
