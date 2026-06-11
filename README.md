# docker-aws-deployment

A URL shortener: create short links, store them in Postgres, and get redirected when visiting the short URL.

## Structure

- `apps/api/` — Express API server (short-link CRUD + redirects, Postgres via `pg`)
- `apps/web/` — Next.js frontend (create links, list them, copy short URLs)
- `packages/shared/` — Shared TypeScript types used across all apps
- `docker-compose.yml` — Local Postgres 17

## Getting started

1. Copy `apps/api/.env.example` to `apps/api/.env` and `apps/web/.env.example` to `apps/web/.env` (defaults work out of the box)
2. Run `pnpm install`
3. Start Postgres: `docker compose up -d postgres`
4. Run `pnpm dev` to start all apps
   - Web: http://localhost:3000
   - API: http://localhost:4000

The API runs migrations (creates the `links` table) automatically on startup.

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/links` | Create a short link. Body: `{ "url": "https://…", "code": "optional-custom-code" }` |
| `GET` | `/api/links` | List all links, newest first |
| `GET` | `/:code` | 302-redirect to the target URL and increment the click count |
| `GET` | `/health` | Health check |

Responses use the `ApiResponse<T>` envelope from `packages/shared`: `{ ok: true, data }` or `{ ok: false, error }`.

- Codes are 7 random base62 characters unless a custom code (3–32 chars, `[A-Za-z0-9_-]`) is given.
- Duplicate custom codes return `409`; invalid URLs (non-http/https) return `400`; unknown codes return `404`.

## Database

Postgres, configured via `DATABASE_URL` in `apps/api/.env` (default: `postgres://shortlinks:shortlinks@localhost:5432/shortlinks`, matching `docker-compose.yml`).

Schema (`apps/api/src/migrations/`):

```sql
CREATE TABLE links (
  code TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps concurrently |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Type-check all packages |
| `pnpm check` | Lint with Biome |
| `pnpm format` | Lint and auto-fix with Biome |
| `docker compose up -d postgres` | Start the local Postgres database |

## Testing

API tests (Vitest + Supertest) live in `apps/api/src/__tests__/` and mock the Postgres pool, so they run without a database: `pnpm --filter api test`.

## Shared types

The `packages/shared` package contains shared TypeScript types (API request/response shapes, etc.) used by all apps. The short-link types are `ShortLink`, `CreateLinkRequest`, `CreateLinkResponse`, and `ListLinksResponse`.

### Adding a new type

1. Add your type to `packages/shared/src/api.ts` (or create a new file)
2. Export it from `packages/shared/src/index.ts`
3. Import it in any app:

```ts
import type { ApiResponse } from "shared";
```

## AI/LLM Guidelines

This project includes an `AGENTS.md` file with coding conventions, naming rules, and project structure guidelines. Any AI tool will automatically pick these up. Edit `AGENTS.md` to customize how AI assistants write code in this project.
