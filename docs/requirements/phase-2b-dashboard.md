# Phase 2b — Dashboard

**Status:** Not started
**Owner:** [your name]
**Depends on:** Phase 2a (complete)

## Goal

Build the actual dashboard screen — the anchor screen designed at the very
start of this project — showing what needs attention across a house's
appliances, backed by the real compute function from Phase 2a. This is the
first phase where the app has a genuine "front door" someone would
actually use day to day.

## In scope

- Dashboard route showing the "needs attention" list, sorted by urgency,
  matching the earlier mockup
- Task row with all three actions: **Mark done**, **Snooze**, and
  **"doesn't apply to my [appliance]"** (task-scoped, per the earlier UX
  fix — not appliance-level)
- Category tiles (Systems / Exterior / Appliances / Safety) as a visual
  section — link targets can be stubbed (e.g. non-functional or a simple
  placeholder page) since the full appliance list/detail view isn't built
  yet
- Empty / all-caught-up state, matching the earlier mockup
- Honest placeholder for appliance types with zero rule content
  (`hasContent: false` from the compute function) — a low-priority, clearly
  informational note, not mixed in with real due items
- Extending the rules-engine compute logic to account for snooze and
  dismiss events (see Task action semantics below) — this was explicitly
  deferred from Phase 2a's function contract to here
- Onboarding's confirmation screen gets a "View your dashboard" link/button
  — first real connection between the two flows

## Out of scope (explicitly deferred)

- Full appliance detail pages — the age-range prompt (progressive
  profiling) and per-appliance task history still don't have a home yet;
  that's a reasonable candidate for its own short phase after this one
- Editing/removing appliances after onboarding
- Multi-house support in the UI — see House selection below
- Undoing a "doesn't apply" dismissal once made
- Notifications/email — Phase 4
- Visual polish beyond "matches the mockups reasonably well" — pixel-level
  design refinement isn't the goal here

## House selection

No auth yet, and the schema technically allows multiple houses per
`user_id` (useful from testing). For this phase: the dashboard shows the
**most recently created house** for `CURRENT_USER_ID`. Not configurable,
no house switcher — just a deliberate, simple default until Phase 5 auth
makes "which house" a real per-user question.

## Task action semantics (extends the Phase 2a compute function)

Phase 2a's compute function only considered `completed` events. This phase
needs to layer in `snoozed` and `dismissed`. For each rule, look at the
**most recent event of any type** (not just completed) and resolve status
in this order:

1. **Latest event is `dismissed`** → rule is hidden from the dashboard
   entirely, permanently (undo is out of scope, see above)
2. **Latest event is `snoozed` and `snooze_until` is today or later** →
   suppressed from the "needs attention" list until that date; doesn't
   need its own visible status in this phase, just absence from the list
3. **Latest event is `snoozed` but `snooze_until` has passed** → treat the
   snooze as expired; fall back to computing status from completion
   history as normal (i.e., ignore the expired snooze, look at the most
   recent `completed` event same as before)
4. **Otherwise** (latest event is `completed`, or no events exist at all)
   → unchanged from Phase 2a: unscheduled / on_track / due_soon / overdue

Snooze needs a lightweight duration choice when triggered — 1 week / 1
month / until next season is a reasonable set, matching the earlier UX
design. "Until next season" can resolve to a fixed +3 months for now
rather than building real seasonal-date logic (that's Phase 3's job).

## Dashboard sections & sorting

- **Needs attention** (the main list): `overdue` first, then `due_soon`,
  then `unscheduled` — within `unscheduled`, `safety`-criticality rules
  sort above `routine` ones, matching the visual-prominence decision from
  earlier. `on_track` items are not shown here — nothing to act on, so no
  reason to surface them.
- **Caught up / empty state**: shown when the needs-attention list is
  empty, matching the earlier mockup (checkmark, "nothing needs attention
  right now," faint next-upcoming item if one exists)
- **No-content note**: appliance types with `hasContent: false` get a
  small, separate, low-priority mention — not blended into the
  needs-attention list, and not counted toward "are you caught up"

## Acceptance criteria

- [ ] Dashboard route renders the needs-attention list correctly sorted
- [ ] All three task actions work and correctly write to `task_events`
- [ ] Compute logic correctly respects the snooze/dismiss precedence rules
      above, with tests covering each case (active snooze, expired snooze,
      dismissed)
- [ ] Empty/caught-up state renders correctly when nothing is outstanding
- [ ] No-content types are shown honestly, separate from real due items
- [ ] Onboarding's confirmation screen links to the dashboard
- [ ] Works end to end on the deployed Vercel URL
- [ ] `BUILDLOG.md` has an entry for this phase

## Suggested daily breakdown (1-2 hrs/day)

1. **Day 1** — Extend the compute function/tests for snooze and dismiss
   precedence (pure logic, no UI yet — same discipline as Phase 2a)
2. **Day 2** — Build the dashboard route: fetch the house's appliance
   instances, run compute, render the needs-attention list and empty state
3. **Day 3** — Build the task row's three actions, wired to real
   `task_events` inserts; category tiles as simple stubs
4. **Day 4** — No-content placeholder, onboarding-to-dashboard link, deploy
   and test live, BUILDLOG entry

## Handoff note for Claude Code

Good first prompt: "Implement Phase 2b as described in
docs/requirements/phase-2b-dashboard.md — start by extending the Phase 2a
compute function to handle the snooze/dismiss precedence rules in Task
action semantics, with tests, before touching any UI. Stop there for
review." As with Phase 2a, the logic extension is worth more scrutiny than
the UI — the four-case precedence order is easy to get subtly wrong (e.g.
an expired snooze accidentally still suppressing a task).
