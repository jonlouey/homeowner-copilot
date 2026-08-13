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
