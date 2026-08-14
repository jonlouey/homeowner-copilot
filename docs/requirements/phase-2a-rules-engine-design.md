# Phase 2a — Rules engine core

**Status:** Not started
**Owner:** [your name]
**Depends on:** Phase 1 (complete)

## Goal

Build the logic that turns "here's an appliance, here's what's been done to
it" into "here's what's due, and how urgently." No UI in this phase — the
output is a function/API response that Phase 2b's dashboard will consume.
Success looks like a script or test suite that proves the logic is correct
against known inputs, not a screen you can click through.

## Why this is its own phase

The dashboard we designed earlier can't show anything real without this —
it would just be a static mockup. Separating the logic from its UI also
means this phase is pure, testable backend work: given fixed inputs, assert
on exact outputs. No browser, no visual review needed to know if it's right.

## In scope

- Extend `maintenance_rules` with two new columns (migration required):
  - `rule_type` — `'recurring'` or `'lifespan'`
  - `criticality` — `'safety'` or `'routine'`
- Write real `maintenance_rules` content for the first 5 appliance types
  from the original v1 scope: **Roof, HVAC, Water Heater, Electrical Panel,
  Sump Pump**
- The compute function: given an `appliance_instance` and its related
  `task_events`, return a status for each applicable rule
- The three-state model (see below)
- Recurring vs. lifespan rule handling (see below)

## Out of scope (explicitly deferred)

- Any dashboard UI — Phase 2b
- Region/seasonal conditioning of rules (`region_condition`,
  `season_months` exist in the schema already but aren't used yet) — Phase 3
- Remaining ~18 appliance types' rule content — Phase 3
- Snooze and "not applicable" event handling in the compute logic — the
  columns/event types exist, but wiring their effect on computed status is
  Phase 2b's concern once there's a UI to trigger them

## Rule types

**Recurring** — frequency-based, doesn't need age. "Clean filter every 1
month," "flush water heater every 12 months," "pump septic every 60
months." Status is computed from `frequency_months` + the most recent
`completed` event in `task_events` for that rule. This is the majority of
v1 content.

**Lifespan** — age-based, needs `age_range` or `install_date` to mean
anything. "Water heaters typically last 8-12 years — plan ahead." Only
evaluated when the appliance instance has real age data (not
`'unknown'`). If age is unknown, lifespan rules simply don't produce output
for that instance — not an error, not a fallback guess.

## The three-state model

Every recurring rule, for a given appliance instance, resolves to one of:

1. **Unscheduled** — no `completed` event exists yet for this rule on this
   instance. No due date is shown or implied — this is the "no fake
   precision" principle. Visual/priority treatment differs by
   `criticality`:
   - `safety` rules in this state get a distinct, more prominent
     "not yet confirmed" treatment — nudging the user to address it soon —
     without inventing a due date
   - `routine` rules in this state get a neutral, low-priority treatment
     — informational, not urgent
2. **Due soon** — a `completed` event exists, and `event_date +
   frequency_months` falls within the urgency window (default: **30
   days** — adjust if it feels wrong once you see it in the dashboard)
3. **Overdue** — a `completed` event exists, and `event_date +
   frequency_months` has already passed

The moment a user marks a task done for the first time, that rule moves
from state 1 into state 2 or 3 permanently for that instance — there's no
returning to "unscheduled" once real history exists.

## Function contract

Rough shape — Claude Code can refine the exact types, but the compute
function should:

- Accept one `appliance_instance` (with its type, age_range/install_date)
  and the full `task_events` history for that instance
- Look up all `maintenance_rules` for that appliance type
- Return an array of `{ rule, status, dueDate | null, criticality }` — one
  entry per applicable rule (skipping lifespan rules when age is unknown)
- Be a pure function wherever possible — no database calls inside the
  compute logic itself, just data in, data out. Fetching the
  instance/events/rules from the database happens in a thin wrapper around
  it. This is what makes it unit-testable without a live database.

**Explicit "no content" signal.** Only 5 of the 23 seeded appliance types
have real rule content as of this phase (see Appendix) — the rest have
zero rows in `maintenance_rules`. When an appliance_instance's type has no
applicable rules at all, the function must distinguish that from "all
caught up" — return something explicit like `{ hasContent: false }` (or an
empty array plus a separate flag, whichever is cleaner) rather than just an
empty array indistinguishable from "nothing due right now." Phase 2b's
dashboard needs this distinction to show honest placeholder copy ("we
don't have guidance for this yet") instead of silently showing nothing for
appliances the user explicitly told the app they have — silence there
would read as a bug, not as an honest content gap.

## Acceptance criteria

- [ ] Migration adds `rule_type` and `criticality` to `maintenance_rules`
- [ ] Real rule rows exist for Roof, HVAC, Water Heater, Electrical Panel,
      Sump Pump — a mix of recurring and lifespan, safety and routine
- [ ] Compute function correctly returns "unscheduled" for a
      freshly-onboarded appliance instance with no task_events
- [ ] Compute function correctly returns "due soon" and "overdue" for
      instances with a `completed` event, tested against both cases
- [ ] Lifespan rules are silently skipped (not errored, not guessed) when
      age_range is `'unknown'`
- [ ] Compute function returns an explicit "no content" signal (not an
      empty array indistinguishable from "caught up") for the 18 appliance
      types with no rule content yet
- [ ] A test suite (unit tests, not manual clicking) covers all three
      states plus the lifespan/unknown-age skip case and the no-content case
- [ ] `BUILDLOG.md` has an entry for this phase

## Suggested daily breakdown (1-2 hrs/day)

1. **Day 1** — Write and run the migration adding `rule_type` and
   `criticality`; write the real rule content for Roof and HVAC as a seed
   script (start with 2 appliance types to validate the shape before
   writing all 5)
2. **Day 2** — Write rule content for the remaining 3 appliance types
   (Water Heater, Electrical Panel, Sump Pump)
3. **Day 3** — Build the compute function for recurring rules (unscheduled
   / due-soon / overdue), with tests
4. **Day 4** — Add lifespan rule handling and the age-unknown skip logic,
   finish tests, BUILDLOG entry

## Handoff note for Claude Code

Good first prompt: "Implement Phase 2a as described in
docs/requirements/rules-engine-design.md — start with the migration adding
rule_type and criticality, then write the maintenance_rules seed content
for Roof and HVAC only, and stop so I can review the content before you
write the rest or touch the compute function." Review the actual rule
content carefully here — task names, frequencies, and criticality labels
are domain judgment calls, not something to approve on autopilot the way
you might a migration file.

## Appendix — researched seed content (all 5 appliance types)

Sourced from a mix of manufacturer guidance, home-inspector references,
and industry associations (searched and cross-checked, not generated from
memory) — see notes per row for the reasoning. Numbers are reasonable
defaults, not precise engineering specs; expect to revise as you get real
usage or better sources.

### Recurring rules

| appliance_type_id | task_name | frequency_months | criticality | note |
|---|---|---|---|---|
| roof | Professional inspection | 12 | routine | Annual is the most common baseline recommendation across sources |
| roof | Clean gutters & check for debris | 6 | routine | Paired task, commonly bundled with roof upkeep |
| hvac | Replace filter | 3 | routine | 90 days is the most-cited manufacturer default; mention pets/allergies increase frequency in the task description text |
| hvac | Professional tune-up | 12 | routine | Annual preseason service is the standard recommendation |
| water_heater | Test T&P relief valve | 12 | **safety** | Life-safety device; failure modes include tank rupture and scalding |
| water_heater | Flush tank (sediment) | 12 | routine | Extends efficiency/lifespan, not a safety issue on its own |
| water_heater | Inspect/replace anode rod | 36 | routine | 2-3 year inspection interval is standard; actual replacement often less frequent |
| electrical_panel | Professional inspection | 24 | **safety** | Residential guidance (not the industrial NFPA 70B figures, which don't apply at this scale) |
| sump_pump | Test pump (pour water, confirm activation) | 6 | **safety** | Flood-prevention device; failure has real property-damage consequences |
| sump_pump | Professional inspection (pit, check valve, backup power, alarm) | 12 | **safety** | Same reasoning as above |

### Lifespan rules

| appliance_type_id | task_name | fires when age_range is | message |
|---|---|---|---|
| roof | Plan for eventual replacement | `15+` | Asphalt shingle roofs typically last 15-30 years — yours may be approaching replacement age. Consider a professional inspection to assess condition. |
| hvac | Plan for eventual replacement | `15+` | HVAC systems typically last 15-25 years. If yours is in this range, start budgeting for eventual replacement. |
| water_heater | Plan for eventual replacement | `8-15`, `15+` | Tank water heaters typically last 8-12 years. Yours may be nearing end of life — watch for rust, leaks, or inconsistent heat. |
| electrical_panel | Consider evaluation | `15+` | Electrical panels typically last 25-40 years, but rising electrical demand can warrant an earlier upgrade. Consider having it evaluated if your home's power needs have grown. |
| sump_pump | Plan for eventual replacement | `8-15`, `15+` | Sump pumps typically last 10-15 years with regular maintenance. Consider having yours evaluated, especially before storm season. |

Lifespan rules are informational nudges, not urgent alerts — they should
render with low-priority visual treatment even when they fire, regardless
of the appliance's `criticality` for its recurring tasks. A `15+` water
heater firing this rule is not the same severity as an overdue T&P valve
test.

