# Phase 0 — Foundation

**Status:** Not started
**Owner:** [your name]
**Depends on:** nothing (this is the starting point)

## Goal

Stand up the project skeleton so every later feature phase has somewhere to land:
a working repo, a deployed "hello world," and the core database schema. No
user-facing features ship in this phase — the definition of done is
"infrastructure exists and is provably working," not "something looks good."

## Why this phase exists

Every later phase (onboarding, dashboard, rules engine, digest) needs a place
to write code, a database to write to, and a pipeline to deploy through.
Building that scaffolding first, deliberately, means Phase 1 onward is pure
feature work — not feature work tangled up with infra decisions.

## In scope

- Repo created with a sane folder structure (see below)
- Next.js (App Router) + TypeScript project initialized
- Postgres database provisioned (Supabase or Neon — pick one, see Decision Log)
- Core schema (v1) created via migration, not hand-run SQL
- Deployed to Vercel, reachable at a public URL, showing a static placeholder page
- `BUILDLOG.md` and `/docs/decisions/` started
- Basic CI: type-check + lint runs on every push (GitHub Actions is fine)

## Out of scope (explicitly deferred)

- Any real UI (onboarding, dashboard, appliance detail) — Phase 1+
- Auth — stub a single hardcoded `user_id` constant instead
- The rules engine logic — Phase 2/3
- Email/digest — Phase 4
- Seed content for maintenance rules — schema only, no real rule rows yet
  (a handful of dummy rows for testing the schema is fine)

## Data model (v1)

Minimum viable schema — expand later, don't over-design now.

```
houses
  id            uuid pk
  user_id       uuid            -- hardcoded constant for now, no auth yet
  address       text
  zip           text
  region        text            -- derived from zip, see Decision Log
  house_type    text            -- 'single_family' | 'condo' | 'townhouse' | 'other'
  created_at    timestamptz

appliance_types
  id            text pk         -- e.g. 'water_heater', 'hvac', 'roof'
  category      text            -- 'systems' | 'exterior' | 'appliances' | 'safety'
  display_name  text

appliance_instances
  id                uuid pk
  house_id          uuid fk -> houses.id
  appliance_type_id text fk -> appliance_types.id
  age_range         text        -- '0-2' | '3-7' | '8-15' | '15+' | 'unknown'
  install_date      date        -- nullable, optional precise override
  status            text        -- 'active' | 'dismissed'
  created_at        timestamptz

maintenance_rules
  id                uuid pk
  appliance_type_id text fk -> appliance_types.id
  task_name         text
  description       text
  frequency_months  int
  season_months     int[]       -- nullable; which calendar months this applies, if seasonal
  region_condition  text        -- nullable; e.g. 'cold_climate', null = applies everywhere

task_events
  id                    uuid pk
  appliance_instance_id uuid fk -> appliance_instances.id
  rule_id               uuid fk -> maintenance_rules.id
  event_type            text    -- 'completed' | 'snoozed' | 'dismissed'
  event_date            timestamptz
  snooze_until           date   -- nullable, only for 'snoozed'
```

Notes:
- No table stores *computed* task status ("this is overdue"). That's derived
  at read time by the rules engine in Phase 2, from `maintenance_rules` +
  `appliance_instances` + `task_events`. Keeping it derived avoids stale-data
  bugs later.
- `task_events` is append-only — never update/delete a row. "Last serviced
  date" for an appliance is just "most recent `completed` event," not a
  separate mutable field.

## Repo structure

```
/app                  Next.js app router pages
/lib                  shared logic (will hold the rules engine in Phase 2)
/db                   schema, migrations, seed scripts
/docs
  /requirements        one .md per feature phase (this file lives here)
  /decisions            lightweight ADRs
/BUILDLOG.md           running daily log of what was built and why
```

## Decision log (fill in as you go)

| Decision | Choice | Why |
|---|---|---|
| Database host | Neon | Composable/serverless Postgres, scale-to-zero fits the low-traffic, bursty usage pattern of a solo side project; native Vercel integration; branching is a nice showcase of a more sophisticated dev workflow than most side projects bother with. Auth deferred to Phase 5 so Supabase's bundled auth wasn't a deciding factor. |
| Region derivation | Static zip-prefix → climate-zone table | Avoids paying for/depending on a geocoding API for something that only needs rough granularity |
| Auth | Deferred to Phase 5, hardcoded user_id for now | Avoids blocking early phases on an auth provider decision |

## Acceptance criteria

Phase 0 is done when all of these are true:

- [ ] `main` branch deploys automatically to a public Vercel URL on push
- [ ] Visiting the URL shows a placeholder page (doesn't need to be styled)
- [ ] Database is reachable from the deployed app (a simple `/api/health`
      route that does a trivial query and returns 200 is enough proof)
- [ ] All five tables above exist via a checked-in migration, not a manual
      console change
- [ ] `appliance_types` is seeded with the ~22 real types, categorized
- [ ] CI runs type-check + lint on every push and passes
- [ ] `BUILDLOG.md` has at least one real entry describing this phase
- [ ] One ADR exists in `/docs/decisions/` (e.g. "why Postgres over Firebase")

## Suggested daily breakdown (1-2 hrs/day)

This phase is small enough to plan day-by-day rather than leaving it as one
lump — useful both for momentum and for your BUILDLOG entries.

1. **Day 1** — `npx create-next-app`, repo on GitHub, first commit, Vercel
   linked and auto-deploying the default page
2. **Day 2** — Provision Postgres, get a connection string working locally,
   write the migration for the five tables
3. **Day 3** — Seed `appliance_types`, write the `/api/health` route, confirm
   the deployed app can reach the database
4. **Day 4** — Set up CI (type-check + lint on push), write the first ADR,
   write the first BUILDLOG entry, tidy the repo structure

## Handoff note for Claude Code

When you open this in Claude Code, a good first prompt is roughly:
"Implement Phase 0 as described in docs/requirements/phase-0-foundation.md —
start with the Next.js scaffold and repo structure, then the migration for
the schema in the Data model section." Review its migration against the
schema above before applying it — don't let it invent additional tables or
fields not listed here.
