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

## 2026-08-13 — Phase 1: onboarding flow

- Built the onboarding flow at `/onboarding` per
  `docs/requirements/phase-1-onboarding.md`: a single client-side component
  (`app/onboarding/onboarding-flow.tsx`) holding local step state across two
  steps, with a third confirmation step shown after successful submission.
  No partial saves — nothing is written to the database until the final
  submit.
- Step 1 (`house-details-step.tsx`) collects address, ZIP, and house type,
  with client-side validation only (no server round-trip). Step 2
  (`appliance-picker-step.tsx`) is a chip-style multi-select across the 23
  seeded `appliance_types`, grouped by category (Systems, Exterior,
  Appliances, Safety).
- House-type filtering hides appliance types that don't apply per the
  table in the requirements doc (e.g. `roof`, `gutters`, `sump_pump`
  hidden for condos), implemented as a static lookup in
  `app/onboarding/filtering.ts`. `hvac`, `water_heater`, and
  `electrical_panel` are pre-checked by default, filtered against whatever
  the current house type still shows.
- Submission (`app/onboarding/actions.ts`, `submitOnboarding`) inserts the
  `houses` row and one `appliance_instances` row per selected type
  together in a single Postgres transaction via the Neon HTTP driver's
  `sql.transaction([...])`, so a partial failure (e.g. a bad
  `appliance_type_id`) rolls back the whole thing — verified directly by
  forcing a foreign-key violation and confirming no `houses` row was left
  behind.
- Zero appliances selected is blocked client-side with an inline message
  rather than allowed through — decision recorded in the Phase 1
  requirements doc's decision log.

One implementation detail worth remembering: `sql.transaction()` sends all
queries in the batch over HTTP as one *non-interactive* transaction, so a
later query can't reference an earlier query's result (no reading back a
generated `id` mid-transaction). Worked around this by generating the
`houses.id` with `crypto.randomUUID()` in the server action before the
transaction starts, then reusing that same id as the FK for every
`appliance_instances` insert in the same batch.

Deploy verification on the live Vercel URL and updating the acceptance
checklist in the requirements doc are still outstanding for Phase 1.

## 2026-08-14 — Phase 2a: rules engine core

- Migration `db/migrations/0002_maintenance_rules_type_criticality.sql`
  extends `maintenance_rules` with `rule_type` (`'recurring' | 'lifespan'`)
  and `criticality` (`'safety' | 'routine'`), per
  `docs/requirements/phase-2a-rules-engine-design.md`. Also made
  `frequency_months` nullable and added `min_age_range`, since lifespan
  rules fire off a minimum age rather than an elapsed-time frequency and
  the original two-column scope had nowhere to store that — a `CHECK`
  constraint enforces that recurring rows populate `frequency_months` and
  lifespan rows populate `min_age_range`, never both or neither.
- Seeded real rule content (`db/seed-maintenance-rules.ts`,
  `npm run db:seed-rules`) for all 5 appliance types in the Phase 2a scope
  — Roof, HVAC, Water Heater, Electrical Panel, Sump Pump — 10 recurring
  rules and 5 lifespan rules, sourced from the requirements doc's Appendix.
  Confirmed in Neon: 15 rows total, correctly split by `rule_type` and
  `appliance_type_id`.
- Built the compute function (`lib/rules-engine/compute.ts`,
  `computeApplianceStatus`) as a pure function — instance, task_events, and
  rules go in as plain data, no database calls inside it. Covered by 14
  unit tests (`lib/rules-engine/compute.test.ts`, `npm test`, using Node's
  built-in test runner) spanning the three named states, the lifespan skip
  cases, and the explicit `{ hasContent: false }` no-content signal for
  appliance types with zero rule rows.

Two corrections made during implementation, beyond what the design doc
specified — both recorded in the requirements doc's decision log:

- **Added a fourth recurring status, `on_track`.** The three-state model
  only defined conditions for `due_soon` (within the 30-day window) and
  `overdue` (past due); a task just completed with months of runway left
  satisfied neither. Forcing it into `due_soon` would have shown false
  urgency, so `on_track` was added to cover it.
- **Lifespan rules skip on two conditions, not one.** The Function
  Contract text only called out skipping when age is unknown, but the
  Appendix content is literally "fires when age_range is 15+" — a
  known-but-below-threshold instance (e.g. a 3-year-old roof) needed to be
  skipped too, not just an unknown one. Implemented as a rank comparison
  against `min_age_range`, which also handles the ranged thresholds (e.g.
  water heater and sump pump's "8-15, 15+") as "at or above the lower
  bound" without any extra schema.

Not yet done: wiring the compute function into an API route or UI (Phase
2b), and rule content for the remaining ~18 appliance types (Phase 3).

## 2026-08-14 — Phase 2b: dashboard, task actions, snooze/dismiss logic

- Built the dashboard route (`app/dashboard/page.tsx`, `data.ts`) per
  `docs/requirements/phase-2b-dashboard.md` — fetches the most-recently-
  created house for `CURRENT_USER_ID`, its active `appliance_instances`,
  and runs `computeApplianceStatus` per instance to build a needs-
  attention list sorted `overdue` → `due_soon` → `unscheduled` (with
  `safety`-criticality rules sorted above `routine` ones within
  `unscheduled`). Added a caught-up/empty state (checkmark, message, and a
  faint "next up" hint pulled from the nearest `on_track` item) and a
  separate no-content note for appliance types with zero rule content.
- Extended the Phase 2a compute function to handle snooze/dismiss
  precedence (`lib/rules-engine/types.ts`, `compute.ts`): added
  `snoozeUntil` to `TaskEventInput` and `'dismissed'`/`'snoozed'` to
  `RuleStatus`. For each rule, the most recent event of *any* type (not
  just `completed`) now resolves status in priority order — a dismissed
  event always wins, an active snooze (`snooze_until` today or later)
  wins, an expired snooze falls through as if it never happened, and a
  `completed` event or no events at all falls through to the unchanged
  Phase 2a logic. Covered by 8 new unit tests (22 total for `compute.ts`).
- Wired up the three task actions — Mark done, Snooze (1 week / 1 month /
  until next season, the last resolving to a fixed +3 months per the doc),
  and "doesn't apply to my [appliance]" — as Server Actions
  (`app/dashboard/actions.ts`) invoked via native HTML form actions
  (`task-actions.tsx`: one `<form>` per row, each button pointing at a
  different bound action via `formAction`). No client components needed
  anywhere. Each action calls `refresh()` from `next/cache` afterward so
  the dashboard's Server Component data re-fetches without a full page
  reload.
- Added the category tile stubs (`category-tiles.tsx`) — four non-
  functional tiles (Systems/Exterior/Appliances/Safety), per the doc's
  explicit allowance to stub the link targets since the appliance list/
  detail view didn't exist yet.
- Added a "View your dashboard" link to onboarding's confirmation screen
  — the first real connection between the two flows.

One bug caught during implementation: Neon's driver returns Postgres
`date` columns (`snooze_until`) as JS `Date` objects with a timezone-
shifted value, not plain `YYYY-MM-DD` strings. The snooze/dismiss
precedence check string-compared `snoozeUntil` directly, so an active
snooze was silently evaluating as expired — no error, just wrong
behavior. Fixed by casting the column to text via `to_char(snooze_until,
'YYYY-MM-DD')` in the query rather than trusting the driver's
auto-conversion; verified live that an actively-snoozed rule is correctly
excluded from the needs-attention list afterward.

## 2026-08-15 — Phase 2c: appliance card dashboard and detail page

- Built the rollup aggregation function (`lib/rules-engine/rollup.ts`,
  `computeApplianceRollup`) per
  `docs/requirements/phase-2c-appliance-cards.md`'s Status model — reads
  `computeApplianceStatus()`'s existing output with no changes to
  `compute.ts` itself. Worst status wins: any `overdue` rule → red; else
  any `unscheduled` rule → yellow; else green, with an amber ring layered
  on top of yellow/green (never red) if any rule is `due_soon`.
  `dismissed`/`snoozed`/`lifespan_notice` rules are excluded from the
  calculation entirely. 13 unit tests cover all 5 documented card-copy
  outcomes plus the gray no-content state.
- Rebuilt the dashboard route as a grid of appliance cards (one per
  `appliance_instance`), each showing an icon, name, and status badge —
  replacing Phase 2b's flat needs-attention list, which is now retired
  (`needs-attention-list.tsx`, `caught-up-state.tsx`, `no-content-note.tsx`
  deleted; their logic is superseded by the rollup + card grid).
  `task-actions.tsx` and `actions.ts` were kept as-is for reuse. Added
  `lucide-react` and mapped all 23 seeded `appliance_types` to an icon
  (`app/dashboard/appliance-icons.tsx`), with a few conceptually related
  types intentionally sharing one (e.g. `hvac`/`furnace_boiler`/
  `chimney_fireplace` → Flame, `washer`/`dryer` → WashingMachine).
- Built the appliance detail page (`app/dashboard/appliances/[instanceId]/`)
  with its three sections: **Summary** (hand-written contractor-voice
  paragraph per appliance type, verbatim from the requirements doc's
  Appendix, for the 5 types with real rule content), **Actions** (reuses
  `task-actions.tsx`/`actions.ts` unchanged, scoped to just this instance's
  overdue/due_soon/unscheduled rules), and **History** (a reverse-
  chronological list of completed `task_events`, plus an install-date/
  age-range prompt when `age_range` is `'unknown'`). Every dashboard card
  now links to its instance's detail page.
- Replaced the Summary section's generic templated status sentence with
  hand-written contractor-voice phrasing per recurring rule
  (`rule-headlines.ts`) — a separate overdue/due_soon/unscheduled line for
  each of the 10 recurring rules (30 lines total), keyed by
  `(appliance_type_id, task_name)` rather than `maintenance_rules.id` since
  the id isn't a stable authoring key. The 4 safety-criticality rules (T&P
  valve, electrical panel inspection, both sump pump rules) carry a light
  safety nudge in their unscheduled phrasing too, not just overdue,
  matching their overdue tone. Verified every real `task_name` in the
  database resolves to a written entry rather than silently falling
  through to the generic fallback (which still exists, for appliance types
  beyond the current 5).

Two bugs caught during implementation, both before they reached the user:

- **`snoozeUntil` was hardcoded to `null`** in the detail page's first
  draft of `data.ts`, instead of being fetched from `task_events` like the
  main dashboard's `data.ts` already did. Would have silently broken the
  dismiss/snooze precedence check on the detail page — every snooze would
  have read as expired. Caught before testing, by re-checking the fetch
  against the established pattern.
- **The headline's rule-priority order didn't match the rollup's own
  Status model.** `pickHeadlineComputation` picked `overdue > due_soon >
  unscheduled`, but the rollup treats `unscheduled` (yellow) as more
  severe than `due_soon` (an amber ring on top of yellow/green). A card
  showing yellow could show a headline about an unrelated, less-severe
  due_soon task instead of the actual reason for the yellow badge. Caught
  by live-testing the wired-in headline content against real data — the
  water heater's headline was naming the due_soon tank flush instead of
  the unscheduled (and safety-relevant) T&P valve test. Fixed to `overdue
  > unscheduled > due_soon`, matching `rollup.ts`.

The install-date/age-range prompt (`updateApplianceAge` in `actions.ts`)
accepts either a coarse `age_range` pick or a precise `install_date`; the
latter also derives an `age_range` bucket from elapsed years, since
`computeApplianceStatus` still only reads `age_range` — `install_date`
remains reserved for a more precise future calculation.

Not yet done: Phase 2c's remaining acceptance criteria — live Vercel
verification.
