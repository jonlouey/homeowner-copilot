# Design system

**Status:** Direction approved, not yet applied to the app
**Depends on:** Phase 2c (complete)

## Goal

Establish a real visual identity for the app. This doc is the single
source of truth for color, type, and component conventions going forward
— every future phase's UI work should be built against these tokens, not
ad hoc choices.

## Direction

Calm, trustworthy, navy-and-white — closer to a well-made financial or
insurance product than a spec sheet. Soft rounded corners (cards and
pills, not sharp edges), a deep navy for primary actions and structure, a
single blue accent for interactive/selected states, and amber reserved
for "needs attention" signals. Shadows are used deliberately, for hover
lift and card separation.

## Color tokens

| Name | Hex | Use |
|---|---|---|
| Navy | `#16294F` | Primary buttons, strong structural elements |
| Navy deep | `#0D1A33` | Primary button hover state |
| Accent | `#2F5FD8` | Interactive/selected state, focus rings, links |
| Accent soft | `#EAF0FE` | Accent fill background (selected radio/chip) |
| Amber | `#B9720C` | "Needs info" / attention status text and accents |
| Amber soft | `#FDF1DE` | Amber fill background (status pill, attention card hints) |
| Amber line | `#F2DDB3` | Amber borders (status pill, attention card) |
| Danger | `#B83232` | Overdue status text/accents |
| Danger soft | `#FBECEB` | Overdue fill background |
| Danger line | `#F0C9C4` | Overdue borders |
| Good | `#1F7A4D` | Up-to-date/all-good status text/accents |
| Good soft | `#E9F7EE` | Good fill background |
| Good line | `#C7E8D3` | Good borders |
| Ink | `#16192A` | Primary text |
| Ink muted | `#5B6072` | Secondary text, labels |
| Ink faint | `#9195A5` | Placeholder/disabled text, faint icons |
| Line | `#DFE2EA` | Default borders |
| Line soft | `#ECEEF4` | Subtle dividers, no-content card fill |
| Paper | `#FBFBFD` | Page background |

Danger and good follow the same text / soft-fill / line-border trio shape
as amber, so all three status colors behave identically wherever the
status pill pattern is used.

**Hero-only tokens (light-on-dark)** — none of the above are calibrated
for light text over a dark photo, which the landing page's hero needed.
Scoped to that context specifically; don't reach for these outside a
dark/photo background.

| Name | Hex | Use |
|---|---|---|
| Hero text | `#E4E8F4` | Hero subtext (the descriptive paragraph under the headline) |
| Hero text muted | `#CDD9FB` | Hero eyebrow label and the credit line's link |
| Hero credit | `#AAB4D1` | Hero photo-credit line's base text |

The headline itself stays plain white — only these three needed a named
value.

> **This project uses Tailwind v4** — there is no `tailwind.config.js` in
> this repo. These tokens live in a `@theme` block in `app/globals.css`
> instead, including `--radius-card`/`--radius-control` for the
> border-radius tokens below, which v4 turns into
> `rounded-card`/`rounded-control` utilities.

Border radius: `card` 12px (cards), `control` 10px (buttons, inputs,
radio-cards), plus standard Tailwind `rounded-full` for pills/chips/dots.

## Typography

Single font family: **Inter**, loaded via `next/font/google`, with a
system-font fallback stack (`-apple-system, "Segoe UI", sans-serif`) so
text never waits on a slow font load.

Type scale used throughout:
- Page title: 28–30px / 700
- Section title: 15px / 700
- Body / label: 14–15px / 600
- Meta / caption: 12–12.5px / 400–600

## Component conventions

- **Corners**: soft, not sharp — `rounded-card` (12px) for cards,
  `rounded-control` (10px) for buttons/inputs/radio-cards, `rounded-full`
  for pills, chips, and status dots
- **Shadows**: soft, low-opacity shadows for hover lift and card
  separation (e.g. `shadow-md` on hover, `-translate-y-px`)
- **Primary button**: full-width, navy, one per screen — never paired
  with an equal-weight secondary button. `h-[52px] rounded-control
  bg-navy-deep text-white font-semibold hover:bg-navy active:translate-y-px`
- **Back navigation**: a quiet text link above the primary button (not
  beside it), not a button — `text-sm font-semibold text-ink-muted
  hover:text-ink`, chevron nudges left on hover
- **Text input**: `h-12 rounded-control border-[1.5px] border-line px-4
  text-[15px]`, focus state `border-accent ring-4 ring-accent-soft`
- **Radio option** (e.g. house type): a full-row selectable card, not a
  bare radio dot — `rounded-control border-[1.5px] border-line`, checked
  state `border-accent bg-accent-soft ring-4 ring-accent-soft`, with an
  18px dot that fills solid accent when checked
- **Chip / multi-select toggle** (e.g. appliance picker): pill-shaped,
  `h-10 rounded-full border-[1.5px] border-line`, checked state
  `border-accent bg-accent-soft text-navy-deep` with a 15px check-dot that
  fills accent + white checkmark. Group under section labels with
  `flex flex-wrap gap-2.5`
- **Status pill**: `rounded-full border bg-{status}-soft px-2.5 py-1
  text-[11px] font-bold uppercase tracking-wide text-{status}` plus a
  small 5px solid dot in the status color before the text. One shape,
  color trio swaps per status (amber/danger/good)
- **Attention card**: left-accented (3px, status-color border-left),
  `rounded-card border border-line bg-white p-[18px]`, icon badge
  top-right, index number top-left, title, status pill at the bottom,
  `hover:shadow-md hover:-translate-y-px`
- **Category card**: horizontal layout, icon badge + name + meta text,
  `flex items-center gap-3 rounded-card border-[1.5px] border-line
  bg-white p-4`, `hover:border-accent hover:shadow-md hover:-translate-y-px`.
  Icon badge: 38px, `rounded-[9px] bg-accent-soft text-accent`

## Status → color mapping (unify with the Phase 2c rollup)

Same rollup logic as before (`computeApplianceRollup`), visual tokens:

| Rollup status | Token trio |
|---|---|
| Red (overdue) | `danger` / `danger-soft` / `danger-line` |
| Yellow (needs info) | `amber` / `amber-soft` / `amber-line` |
| Green (all good) | `good` / `good-soft` / `good-line` |
| Gray (no content) | `ink-faint` text, `line-soft` fill |

**Open question, not resolved here:** the status-pill pattern is one pill
per card. Whether "due soon" gets its own pill state, reuses amber, or
needs a different treatment isn't specified — flagging rather than
guessing.

**Dark mode is unsupported.** Not addressed in this direction.

## Product decisions

- **Category cards navigate to a filtered list of that category's
  appliances** (e.g. clicking "Systems" shows just the Systems
  appliances). This is the click target for the category card pattern
  below.
- **No home-health summary banner for now.** The dashboard stays exactly
  attention cards + category cards — no completion ring, no "N tasks
  need attention" banner at the top. Revisit if the empty/sparse states
  feel wrong once real usage exists.

## Rollout scope

This is a visual system, not new functional work. Apply it across the
existing app (dashboard cards, appliance detail page, onboarding) without
changing underlying logic, data flow, or component structure — don't
touch `lib/rules-engine/`, `app/*/actions.ts`, or any `data.ts` files
(the one exception is the category-card navigation decision above, which
is new, minimal routing, not a logic change). Rebuild each pattern as a
proper component wired to real data, not copy-pasted from the throwaway
HTML mockups in `docs/designs/reference/`.

## Open product questions

Still unresolved — decide before or during the relevant build step,
don't guess:

1. Per-category status instead of raw counts on category cards — "2 of 7
   need info" beats "7 items."
2. Time/due-date surfacing somewhere on the dashboard — next-due task,
   overdue flags, last-checked dates.
3. Whether "Needs attention" and "Categories" should carry different
   visual weight (time-sensitive vs. static navigation).

## Suggested rollout order

1. Global tokens: `@theme` block + Inter font setup, applied to
   `globals.css` and root layout
2. Dashboard card grid (attention cards + category cards)
3. Appliance detail page (Summary/Actions/History sections)
4. Onboarding flow (house details radio-cards, appliance picker chips,
   confirmation)
