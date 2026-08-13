# 0001. Database: Neon over Supabase

**Status:** Accepted

## Context

Phase 0 needs a Postgres host to provision before the schema migration can be
written. The two candidates were Neon and Supabase — both offer managed,
serverless-friendly Postgres with a free tier suitable for a solo side
project.

Auth was a traditional point in Supabase's favor (it bundles an auth
provider), but this project defers auth to Phase 5 with a hardcoded `user_id`
in the meantime, so a bundled auth system isn't a deciding factor here.

## Decision

Use Neon.

- Scale-to-zero fits the low-traffic, bursty usage pattern of a solo side
  project — no cost or capacity planning for idle time.
- Native Vercel integration keeps deployment and connection-string wiring
  simple.
- Branching gives a more sophisticated dev workflow (e.g. per-PR database
  branches) than most side projects bother setting up, and is a nice
  showcase of that.

## Consequences

- No bundled auth provider — Phase 5 will need to pick one separately
  instead of adopting whatever Supabase ships with.
- The app depends on Neon's connection pooler and HTTP/WebSocket drivers
  (`@neondatabase/serverless`) rather than a plain `pg` connection, which is
  a Neon-specific integration detail to carry if the host ever changes.
- Branching is available as a workflow tool (e.g. per-PR preview databases)
  but isn't wired into CI/CD yet — that's a future enhancement, not part of
  Phase 0.
