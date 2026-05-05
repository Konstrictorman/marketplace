# Marketplace

Institutional **marketplace** for a university community: students can publish, browse, and trade goods in a trusted, moderated environment. The product pairs a **Next.js** storefront with a **Express** REST API and **PostgreSQL** (via **Prisma**).

This repository is the single source of truth for frontend, backend, and shared packages.

**Clone:** `git clone -b master https://github.com/Konstrictorman/marketplace.git`

## Monorepo layout

The project uses **npm workspaces**. Install dependencies from the **repository root**; each app and package has its own `package.json`.

```text
marketplace/
├── .github/
│   └── workflows/              # GitHub Actions (e.g. ci.yml)
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/         # Env-driven settings (CORS)
│   │   │   ├── lib/          # async-handler, http-errors, validation-error
│   │   │   ├── middleware/   # error-handler, validate-body, validate-query
│   │   │   ├── routes/       # HTTP routers (+ routes/index.ts)
│   │   │   ├── services/     # Domain / DB logic per feature
│   │   │   ├── types/        # Local TS augmentations (e.g. express.d.ts)
│   │   │   ├── app.ts        # Express app factory
│   │   │   └── index.ts      # Entry: dotenv, listen
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── app/              # Next.js App Router (pages, layouts, global CSS)
│       ├── public/           # Static assets (images, SVGs)
│       ├── package.json
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       ├── next-env.d.ts
│       ├── README.md
│       ├── AGENTS.md
│       └── CLAUDE.md
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── migrations/   # SQL migration history
│   │   │   └── schema.prisma
│   │   ├── scripts/          # e.g. safe-generate.mjs (Prisma client generate)
│   │   ├── src/              # prisma singleton + re-exports (@marketplace/database)
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── types/
│       ├── src/              # Shared DTOs / types (@marketplace/types)
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml          # Local PostgreSQL
├── eslint.config.mjs
├── prettier.config.mjs
├── .prettierignore
├── .dockerignore
├── .gitignore
├── .env.example
├── package.json
├── package-lock.json
└── README.md
```

| Path                                               | Role                                                                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **`.github/workflows/`**                           | CI pipelines (install, migrate, lint, format check, build).                                                                                 |
| **`.env.example`**                                 | Optional root template for `DATABASE_URL` when running Prisma from the repo root.                                                           |
| **`.gitignore`**                                   | Ignores dependencies, build output, secrets, editor noise.                                                                                  |
| **`.dockerignore`**                                | Excludes paths from Docker build context.                                                                                                   |
| **`.prettierignore`**                              | Paths Prettier should not rewrite.                                                                                                          |
| **`docker-compose.yml`**                           | Local Postgres for development.                                                                                                             |
| **`eslint.config.mjs`**                            | Shared ESLint flat config for `apps/web`, `apps/api`, and `packages/*`.                                                                     |
| **`prettier.config.mjs`**                          | Shared formatting rules.                                                                                                                    |
| **`package.json`** / **`package-lock.json`**       | Workspace root manifest and lockfile (`npm install` / `npm ci` here).                                                                       |
| **`README.md`**                                    | Project documentation.                                                                                                                      |
| **`apps/web/`**                                    | Next.js 16 + React + Tailwind; **`app/`** App Router UI; **`public/`** static files; config at package root. Uses **`@marketplace/types`**. |
| **`apps/api/`**                                    | Express (ESM) REST API; **`src/`** layout below. Uses **`@marketplace/database`** and **`@marketplace/types`**.                             |
| **`packages/database/`** (`@marketplace/database`) | Prisma schema, migrations, scripts, **`src/`** Prisma client singleton — sole DB schema surface.                                            |
| **`packages/types/`** (`@marketplace/types`)       | Hand-written shared types (no Prisma in the browser).                                                                                       |

### `apps/api/src` (API layout)

| Path              | Role                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| **`app.ts`**      | Builds the Express app: JSON body parser, **CORS**, mounted routers, **404**, **error handler**. |
| **`index.ts`**    | Loads `dotenv`, calls `createApp()`, listens on **`PORT`**.                                      |
| **`config/`**     | Environment-driven configuration (e.g. **`cors.ts`** from `CORS_ORIGIN`).                        |
| **`routes/`**     | Feature routers; compose them in **`routes/index.ts`**.                                          |
| **`services/`**   | Domain and persistence helpers (call **`prisma`** here; keep route handlers thin).               |
| **`middleware/`** | **`error-handler.ts`** (JSON errors), **`validate-body.ts`** / **`validate-query.ts`** (Zod).    |
| **`lib/`**        | **`HttpError`**, **`ValidationError`**, **`asyncHandler`** for async routes.                     |
| **`types/`**      | Local TypeScript declarations (e.g. **`express.d.ts`** for `res.locals`).                        |

**CORS:** set **`CORS_ORIGIN`** in `apps/api/.env` to a comma-separated list (e.g. `http://localhost:3000`). If unset, the API is permissive outside **production**; in production, set explicit origins.

**Errors:** handlers respond with JSON `{ "error": { "code", "message", "details?" } }`. Throw **`HttpError`** / **`ValidationError`** (or let **`ZodError`** surface); wrap async handlers with **`asyncHandler`** so rejections reach the error middleware.

**Validation:** use **`validateBody(schema)`** / **`validateQuery(schema)`** before the handler; on success, **`req.body`** is typed from Zod and query results live on **`res.locals.validatedQuery`**.

### What goes in `packages/database`?

Put everything that defines **how data is stored** and **how the app talks to Postgres** with Prisma:

- **`prisma/schema.prisma`** — models, enums, relations (your full E/R diagram grows here).
- **`prisma/migrations/`** — versioned SQL migrations (`migrate dev` / `migrate deploy`).
- **`src/index.ts`** — exports `prisma` (singleton `PrismaClient`) and re-exports `@prisma/client` types for server code.

Do **not** put Express routes or React components here. The **API** imports `prisma` from `@marketplace/database` and implements HTTP + business rules.

### What goes in `packages/types`?

Put **cross-cutting TypeScript types** that are **not** tied to the database layer:

- Request/response DTOs for REST endpoints consumed by both server and client.
- Shared constants and small utility types (e.g. pagination query shape).

When a type is **100% derived from Prisma**, you can import it from `@marketplace/database` in **server-only** code; for **client-safe** shapes, duplicate or map into `@marketplace/types` so the web bundle never pulls in Prisma.

## Requirements

Supported versions are in **`package.json`** → **`engines`** (Node **≥ 20.19**, npm **≥ 10**). Prefer an active **LTS** Node release.

**Docker** is used for **local PostgreSQL** only (see `docker-compose.yml`). Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose on Linux).

## Setup

1. Clone the repository.
2. From the **root**:

   ```bash
   npm install
   ```

3. Start **Postgres**:

   ```bash
   docker compose up -d
   ```

4. Copy env files and set **`DATABASE_URL`** (defaults match Docker):

   ```bash
   copy apps\web\.env.example apps\web\.env.local
   copy apps\api\.env.example apps\api\.env
   ```

   On macOS/Linux use `cp`. Optionally copy **`.env.example`** → **`.env`** at the repo root if you run Prisma CLI from the root.

5. Apply migrations:

   ```bash
   npm run db:migrate
   ```

   (Uses `prisma migrate dev` in `@marketplace/database`.)

   If you previously applied an older starter migration and Prisma reports drift, reset the **local** database (data loss) with `npx prisma migrate reset` from `packages/database`, then run `db:migrate` again.

## Running locally

**API** (default `3001`):

```bash
cd apps/api
npm run dev
```

**Web** (default `3000`):

```bash
cd apps/web
npm run dev
```

- Text health: `http://localhost:3001/health`
- DB health: `http://localhost:3001/health/db` (returns `503` if Postgres is down)
- Web: `http://localhost:3000`

API folder roles, CORS, errors, and Zod usage are described under **Monorepo layout** → **`apps/api/src` (API layout)**.

## Root scripts

| Script                 | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `npm run lint`         | ESLint for `apps/*` and `packages/*`            |
| `npm run lint:fix`     | ESLint with `--fix`                             |
| `npm run format`       | Prettier write                                  |
| `npm run format:check` | Prettier check                                  |
| `npm run build`        | `database` → `types` → `api` → `web`            |
| `npm run db:migrate`   | `prisma migrate dev` (local schema iteration)   |
| `npm run db:deploy`    | `prisma migrate deploy` (CI / production-style) |
| `npm run db:studio`    | Prisma Studio                                   |

## Environment variables

| File                      | Purpose                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| **`apps/api/.env`**       | `PORT`, **`DATABASE_URL`**, future secrets. Loaded by `dotenv` in the API. |
| **`apps/web/.env.local`** | `NEXT_PUBLIC_*` for the browser (e.g. API URL).                            |
| **`.env.example`** (root) | Optional; same `DATABASE_URL` if you run Prisma from the repo root.        |

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on pushes to **`master`** and on **pull requests**: Postgres service, `npm ci`, **`npm run db:deploy`**, lint, Prettier check, and **`npm run build`**.

**Remote:** [https://github.com/Konstrictorman/marketplace.git](https://github.com/Konstrictorman/marketplace.git) — default branch **`master`**.

## Planned direction

- Grow **`schema.prisma`** to your full marketplace E/R (users, roles, products, orders, chat, …).
- **JWT or session auth**, WebSockets, admin moderation.
- Optional **Dockerfiles** for deploying API + web as containers.

Contributions follow the root **ESLint** and **Prettier** configuration.
