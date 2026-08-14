# Phase 2c — Appliance card dashboard & detail page

**Status:** Not started
**Owner:** [your name]
**Depends on:** Phase 2b (complete)

## Goal

Replace the flat "needs attention" task list with a dashboard of
per-appliance status cards, and build the appliance detail page (Summary /
Actions / History) that each card opens into. This is a redesign of how
Phase 2b's data is *presented*, not a rebuild of the underlying logic — the
compute function, task actions, and task_events model from 2a/2b are
reused almost entirely as-is.

## Why this phase exists

The flat task list (Phase 2b) technically worked, but didn't answer the
question a homeowner actually has: "how's my house doing, appliance by
appliance?" A card grid with a clear status per appliance, opening into a
real per-appliance page, matches the original product vision better than a
shuffled list of individual tasks ever did.

## In scope

- Dashboard route redesigned as a grid of appliance cards — one per
  `appliance_instance` the house has, each showing: icon, name, and a
  status badge
- Appliance-level status rollup (see Status model below), computed from
  the existing per-rule statuses the Phase 2a compute function already
  produces — no changes needed to `compute.ts` itself, just a new
  aggregation layer on top of its output
- Appliance detail page per instance, with three sections:
  - **Summary** — static, hand-written inspector-voice content per
    appliance type, with one templated sentence reflecting current status
    (see Summary content below)
  - **Actions** — the same task rows and same three actions (mark done /
    snooze / dismiss) from Phase 2b, just scoped to this one appliance
    instead of shown flat across the whole house
  - **History** — the "add install date / age" prompt (the
    progressive-profiling nudge deferred since onboarding), plus a
    chronological list of completed actions, generated automatically from
    `task_events` — no separate manual entry needed for that list
- No-content appliance types (e.g. Dryer) render a distinct gray card,
  clearly separate from the three real statuses

## Out of scope (explicitly deferred)

- Any changes to the compute function's core logic — this phase only
  adds an aggregation/rollup layer that reads its existing output
- Category tiles — already stubbed in Phase 2b, untouched here
- Real AI-generated summary text — Summary content is hand-written per
  appliance type, not generated live (see Summary content below for why)
- Multi-house support — same single-house assumption as Phase 2b

## Status model

**Per-appliance rollup, in priority order** (worst status wins):
1. Any action `overdue` → **Red**
2. Else any action `unscheduled` (missing info) → **Yellow**
3. Else → **Green**

**Amber ring overlay** — layered on top of Yellow or Green (never Red,
which is already maximally urgent) if any action is `due_soon`. This is a
visual modifier, not a fourth base color — the badge is still
fundamentally red/yellow/green, just with an additional ring.

**No-content state** — a distinct gray, not part of the red/yellow/green
system at all. An appliance type with zero `maintenance_rules` rows
(`hasContent: false`) always renders this way regardless of anything else.

`dismissed` and `snoozed`-while-active actions are excluded from the
rollup calculation entirely, same as they're excluded from Phase 2b's
needs-attention list — a dismissed or actively-snoozed action shouldn't
drag an otherwise-fine appliance into yellow or red.

## Card copy

- Red: **"Needs attention"**
- Yellow: **"Needs info"**
- Green, no ring: **"All good"**
- Green or Yellow, with ring: **"Action needed soon"**
- No-content: **"No guidance yet"**

## Summary content

Written once per appliance type (starting with the 5 types that already
have rule content), not generated live per user — same reasoning as
before: real-time generation adds cost, latency, and real risk of subtly
wrong advice on appliances where accuracy matters.

Voice: a trusted contractor explaining things to a customer they know
well — friendly, direct, and professional, not stiff and not overly
casual. Not a Q&A format — flowing paragraph copy that naturally covers
what the appliance does, the milestones worth watching for, its typical
useful life, and the maintenance that actually matters, without labeling
each part explicitly. See the Appendix for the finished content and its
tone.

The current-status templated sentence (e.g. "Right now, your filter is
overdue for a change...") appends after the paragraph, not blended into
it — keeps the static content stable and the dynamic part isolated.

## Acceptance criteria

- [ ] Dashboard renders one card per appliance instance, correct icon,
      name, and status badge
- [ ] Rollup logic matches the priority order above, tested against cases
      covering each of the 5 status outcomes (red, yellow, green, ringed
      green, ringed yellow) plus no-content
- [ ] Amber ring never appears on a red card
- [ ] Dismissed/actively-snoozed actions are excluded from rollup, with a
      test proving an appliance with only a dismissed overdue action shows
      green, not red
- [ ] Detail page renders Summary, Actions, History sections correctly
      for at least the 5 appliance types with real rule content
- [ ] Actions section behaves identically to Phase 2b's task rows (same
      three actions, same task_events writes) — no regression
- [ ] History section's "add install date/age" prompt writes to
      `appliance_instances.age_range`/`install_date`, and the completed
      action list reflects real `task_events` rows in chronological order
- [ ] No-content appliance types render the gray "no guidance yet" card
      and a matching detail-page state (no Actions section content, since
      there's nothing to show)
- [ ] Works end to end on the deployed Vercel URL
- [ ] `BUILDLOG.md` has an entry for this phase

## Suggested daily breakdown (1-2 hrs/day)

1. **Day 1** — Build the rollup aggregation function (pure logic, tests
   first, same discipline as Phase 2a/2b) — no UI yet
2. **Day 2** — Rebuild the dashboard route as the card grid, wired to real
   rollup output
3. **Day 3** — Build the appliance detail page shell + Actions section
   (mostly relocating Phase 2b's existing task row component)
4. **Day 4** — Write the 5 Summary paragraphs, wire the templated status
   sentence, build the History section (age/install prompt + completed
   action list)
5. **Day 5** — Deploy, test live, BUILDLOG entry

## Handoff note for Claude Code

Good first prompt: "Implement Phase 2c as described in
docs/requirements/phase-2c-appliance-cards.md — start with the rollup
aggregation function and its tests, reading the existing compute()
output, no UI yet. Stop there for review." As with prior phases, the
rollup logic (especially the dismissed/snoozed exclusion and the
ring-never-on-red rule) is worth more scrutiny than the UI layer that
consumes it.

## Appendix — Summary content (all 5 appliance types)

Static base content per appliance type. Voice: a trusted contractor
explaining things to a customer they know well — friendly, direct,
professional. The templated current-status sentence (e.g. "Right now,
your filter is overdue for a change...") gets appended after each
paragraph, not blended into it.

**Roof:** Your roof has one job, but it's the job that matters most —
keeping water out of your home, consistently, for decades. I'd recommend
an annual inspection, and I'd pair that with regular gutter cleaning,
since the two work together: clogged gutters push water back up under the
shingles, which causes damage that has nothing to do with the roofing
material itself. Most asphalt shingle roofs last 15 to 30 years depending
on the material and your climate. Once you cross that 15-year mark, it's
worth paying closer attention — granule loss, curling shingles, soft spots
— not because something's necessarily wrong, but because that's the
window where issues tend to start.

**HVAC:** Of everything in this house, your HVAC system does the most
constant, least visible work — and the filter is genuinely the single
biggest factor in how well it holds up. I'd replace it every three months,
more often if you have pets or allergies in the house, and schedule a
professional tune-up annually on top of that. These systems typically last
15 to 25 years, though you'll usually notice some decline in efficiency
starting around 10 to 12 years — that's expected wear, not a sign of
failure.

**Water Heater:** This is one appliance where I'd ask you to take the
maintenance seriously, not just as a formality. The pressure relief valve
is a genuine safety component, and I'd test it every year without fail.
Beyond that, an annual tank flush will extend its working life, and the
anode rod is worth checking starting around the two-to-three-year mark.
Tank water heaters typically last 8 to 12 years — once you're past 8, it's
worth watching for early signs of wear, like rust, leaks, or inconsistent
heating.

**Electrical Panel:** This is the kind of system that fails quietly,
without much warning, which is exactly why I recommend a periodic
professional inspection rather than waiting for a visible problem. Every
two years is a reasonable interval. If your household's power demands
have grown — an EV charger, a major addition — I'd move that inspection up
rather than waiting for the next scheduled check. Panels generally last 25
to 40 years, so this isn't an urgent concern in most cases, but it's not
one to overlook either.

**Sump Pump:** I'd put this one in the "don't wait to find out" category.
Test it directly — pour water into the pit and confirm it activates —
rather than assuming it's working because it's been quiet, and I'd do that
check twice a year, ideally ahead of your rainier season. An annual
professional inspection of the pit, check valve, backup power, and alarm
is worth the investment too. With regular maintenance, these last 10 to 15
years; without it, closer to 7 to 10. This is genuinely a safety-relevant
appliance — if it fails, the result is active flooding, not a minor
inconvenience.



