# Phase 1 — Onboarding

**Status:** Not started
**Owner:** [your name]
**Depends on:** Phase 0 (complete)

## Goal

Let someone add their house and tell the app which appliances they have,
writing real rows into the database Phase 0 set up. Ends at a plain
confirmation screen — no dashboard, no task list. This phase is entirely
about capturing input cleanly, not about surfacing anything back yet.

## In scope

- Two-step onboarding flow, matching the UX designed earlier:
  1. **House details** — address, zip, house type (single_family / condo /
     townhouse / other)
  2. **Appliance picker** — chip-style multi-select across the 23 seeded
     appliance types, grouped into the 4 categories (Systems, Exterior,
     Appliances, Safety), with sensible types pre-checked
- House-type-aware filtering: some appliance types don't make sense for
  some house types (see Filtering rules below) and shouldn't be offered
- Submitting writes:
  - one row to `houses`
  - one row to `appliance_instances` per selected appliance type, with
    `age_range = 'unknown'` and `status = 'active'` — age collection is
    explicitly deferred, see Decision log
- A plain confirmation screen after submission (e.g. "You're set — N
  appliances added to 142 Maple St") — no task list, no dashboard link yet
- No auth — use a single hardcoded `user_id` constant (see Decision log)

## Out of scope (explicitly deferred)

- The dashboard / "due soon" list — Phase 2
- Age-range collection during onboarding — deferred by design (see the
  progressive-profiling discussion); onboarding only asks "which
  appliances," not "how old." Age gets asked later, in context, on the
  appliance detail page — which doesn't exist until Phase 2 either, so for
  now every appliance_instance simply starts as `'unknown'`.
- Editing/removing appliances after onboarding — Phase 2 (via the category
  tiles / appliance list, as discussed)
- Real authentication — still just the hardcoded constant from Phase 0's
  schema design
- Any styling polish beyond "clean and usable" — this phase proves the
  flow works, not that it looks final

## Filtering rules (house type → hidden appliance types)

Keep this simple for v1 — a static lookup, not a config UI:

| House type | Hidden from picker |
|---|---|
| `single_family` | none — all 23 types shown |
| `condo` | `roof`, `gutters`, `siding`, `foundation`, `basement_waterproofing`, `driveway_walkways`, `sump_pump` |
| `townhouse` | `sump_pump` (varies by unit, safest to hide by default) |
| `other` | none — show everything, let the user decide |

This list is a starting guess, not a firm spec — revisit once you see real
usage. It's deliberately conservative (when in doubt, show it) since hiding
something someone actually has is worse than showing something they don't.

Condo/townhouse ownership boundaries vary a lot in practice (some condo
owners are responsible for their own HVAC/water heater despite HOA-managed
exteriors, some aren't) — so when the picker hides types based on house
type, show a small line of copy near it, e.g. "We've hidden a few types
based on typical condo ownership — add anything we missed," so it reads as
a helpful default rather than an assumption about their home.

## Pre-checked defaults

Pre-check these on the appliance picker, matching the earlier mockup:
`hvac`, `water_heater`, `electrical_panel`. Everything else starts
unchecked. This isn't derived from anything — it's a static list of the
most commonly-present types, to reduce taps for the typical case.

## Data flow

- Both steps live in one client-side flow (can be one page with local step
  state, or two routes — implementer's choice) but submission happens once,
  at the end, not per-step. No partial saves to the database mid-flow.
- Use a Next.js server action (or an API route, whichever is more
  straightforward to implement) that receives the house details + selected
  appliance type IDs, and performs the two inserts inside a transaction —
  a house should never be created without at least the selection step
  completing, and vice versa.

## Decision log

| Decision | Choice | Why |
|---|---|---|
| Auth stand-in | Hardcoded `user_id` constant, defined once in `/lib` | Matches the Phase 0 schema decision; avoids blocking this phase on picking/wiring an auth provider |
| Age collection timing | Deferred entirely out of onboarding | Progressive profiling — asking "how old" upfront adds friction before any value has been shown; better asked in context later |
| Onboarding step count | 2 steps, not 3 | The original UX sketch had a third "age" step; cut per the above, keeps onboarding to the two steps that actually block generating a task list later |

## Acceptance criteria

- [ ] Visiting the onboarding route shows the house details step first
- [ ] House type selection correctly filters which appliance types appear
      in step 2, per the table above
- [ ] Pre-checked defaults appear correctly on step 2
- [ ] Submitting with at least one appliance selected creates one `houses`
      row and one `appliance_instances` row per selection, all with
      `age_range = 'unknown'`
- [ ] Submitting with zero appliances selected is either prevented with a
      clear inline message, or allowed but produces a house with no
      appliances — pick one behavior deliberately and note it in the
      Decision log once decided
- [ ] Confirmation screen shows after successful submission, with an
      accurate count of appliances added
- [ ] The whole flow works on the deployed Vercel URL, not just locally
- [ ] `BUILDLOG.md` has an entry for this phase

## Suggested daily breakdown (1-2 hrs/day)

1. **Day 1** — Build the house details step (form + validation), wire the
   server action to insert a `houses` row, confirm a row lands in Neon
2. **Day 2** — Build the appliance chip picker UI, wire up house-type
   filtering and pre-checked defaults (no submission yet, just the UI)
3. **Day 3** — Wire the actual submission: insert `appliance_instances`
   rows tied to the created house, build the confirmation screen
4. **Day 4** — End-to-end test locally, deploy, test on the live Vercel
   URL, write the BUILDLOG entry

## Handoff note for Claude Code

Good first prompt: "Implement Phase 1 as described in
docs/requirements/phase-1-onboarding.md — start with the house details
step and its server action, then stop and show me before building the
appliance picker step." As with Phase 0, review the filtering-rules
implementation and the transaction behavior specifically before approving
— those are the two places a subtle bug would be easy to miss.
