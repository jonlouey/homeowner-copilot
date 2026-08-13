# Build Log

Running log of what was built and why, one entry per work session.

## 2026-08-13 — Phase 0: project scaffold

- Initialized Next.js (App Router) + TypeScript project in place via
  `create-next-app` (no Tailwind, ESLint enabled, `@/*` import alias).
- Required bumping local Node from 17.3.0 (EOL, below Next.js's `>=20.9.0`
  minimum) to 20.20.2 via Homebrew (`node@20`, linked as default).
- Added `/lib`, `/db`, and `/docs/decisions` per the repo structure in
  `docs/requirements/phase-0-foundation.md` (currently empty, placeholders
  only — no migrations or rules-engine code yet).
- Deployment, database provisioning, and the schema migration are still
  outstanding for Phase 0.

## 2026-08-13 — Phase 0: schema, seed data, health check, CI, deploy

- Provisioned a Neon Postgres project and wired up `lib/db.ts` as the
  connection module (`@neondatabase/serverless`, reading `DATABASE_URL`).
  Wrote the migration for the five Phase 0 tables (`houses`,
  `appliance_types`, `appliance_instances`, `maintenance_rules`,
  `task_events`) as `db/migrations/0001_init_schema.sql`, matching the data
  model in `docs/requirements/phase-0-foundation.md`, and applied it via a
  small runner (`db/migrate.ts`, `npm run db:migrate`) rather than by hand.
- Seeded `appliance_types` with 23 rows across the four categories
  (systems, exterior, appliances, safety) via `db/seed.ts`
  (`npm run db:seed`), using `ON CONFLICT ... DO UPDATE` so it's safe to
  re-run.
- Added `GET /api/health`, which runs `SELECT 1` against the database and
  returns `{ status: 'ok' }` (200) or the error message (500).
- Added a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs
  type-check and lint on push to `main` and on pull requests. Linked the
  repo to Vercel so pushes to `main` auto-deploy.
- Added an ADR (`docs/decisions/0001-database-neon-vs-supabase.md`)
  recording the Neon-over-Supabase decision from the requirements doc's
  decision log.

Two gotchas worth remembering:

- Neon's `Pool` (needed for the multi-statement migration/seed scripts,
  as opposed to the single-query HTTP client used at request time) is
  websocket-based, and Node doesn't provide a `WebSocket` implementation
  by default under v20. Had to add the `ws` package and set
  `neonConfig.webSocketConstructor = ws` in `db/migrate.ts` and
  `db/seed.ts`.
- This Next.js version generates layout/route param types (e.g.
  `LayoutProps<"/">` in `app/layout.tsx`) on demand into the gitignored
  `.next/` directory rather than shipping them statically, so plain
  `tsc --noEmit` fails on a clean checkout. CI's `type-check` script runs
  `next typegen && tsc --noEmit` to fix that.
