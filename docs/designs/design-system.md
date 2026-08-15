# Design system

**Status:** Direction approved, not yet applied to the app
**Depends on:** Phase 2c (complete)

## Goal

Establish a real visual identity for the app, replacing the plain
default Tailwind styling used through Phase 2c. This doc is the single
source of truth for color, type, and component conventions going forward
— every future phase's UI work should be built against these tokens, not
ad hoc choices.

## Direction

Editorial and architectural, inspired by Dezeen, Design Milk, and Dwell
Home Co — confidence through restraint, not decoration. White canvas as
the dominant field, black as ink (structure and text), a deep restrained
green as a considered accent grounded in the subject matter (home, care,
maintenance) rather than a generic "tech green." Deliberately avoiding the
common AI-generated default of a near-black background with a single
bright accent color — this is the inverse: light field, sparing color.

Presentation reads like an inspection report or spec sheet: hairline
rules instead of shadows, sharp corners instead of soft rounded cards,
monospace data/labels instead of decorative flourishes. This echoes the
contractor-voice content already written for the appliance detail pages
— the visual language and the writing voice should feel like the same
source.

## Color tokens

| Name | Hex | Use |
|---|---|---|
| Canvas | `#FAFAF8` | Page background |
| Ink | `#141412` | Primary text, borders, structural lines |
| Pine | `#1B4332` | Brand accent, "good" status, primary interactive elements |
| Hairline | `#E4E2DC` | Dividers, card grid lines, default borders |
| Muted | `#6B6B63` | Secondary text, timestamps, captions |
| Faint | `#B4B2A9` | No-content / disabled state text and icons |
| Danger | `#E24B4A` | Overdue status only — a deliberate departure from the calm palette |
| Warning | `#BA7517` | Needs-info status and due-soon indicators |

**Rule: red and amber only appear for genuine urgency.** Their rarity is
what makes them work — if they show up anywhere else (decorative
accents, unrelated UI chrome), they stop reading as signals.

Tailwind config addition:

```ts
// tailwind.config.ts
colors: {
  canvas: '#FAFAF8',
  ink: '#141412',
  pine: '#1B4332',
  hairline: '#E4E2DC',
  muted: '#6B6B63',
  faint: '#B4B2A9',
  danger: '#E24B4A',
  warn: '#BA7517',
}
```

## Typography

Three-role pairing, loaded via `next/font/google` (all open-source,
self-hostable, no licensing concern):

- **Display** (headings, appliance names): Space Grotesk, weights 500/700
- **Body** (paragraphs, Summary content, general UI text): Public Sans,
  weight 400/500
- **Data** (dates, statuses, index numbers, technical labels): IBM Plex
  Mono, weight 400/500

```ts
// app/layout.tsx or a shared fonts.ts
import { Space_Grotesk, Public_Sans, IBM_Plex_Mono } from 'next/font/google'

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' })
const body = Public_Sans({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })
```

The mono face isn't decorative — reserve it specifically for genuinely
data-like content (dates, statuses, counts, index numbers), not general
UI text. Using it everywhere would flatten the distinction that makes it
meaningful.

## Component conventions

- **Corners**: sharp or minimal (0-2px radius) throughout — no default
  Tailwind `rounded-lg`/`rounded-xl` card styling
- **Borders over shadows**: 1px hairline borders (`border-hairline`), no
  `box-shadow` anywhere. This is a hard rule, not a preference — shadows
  read as generic SaaS, hairlines read as the spec-sheet direction
- **Status indication**: a left-edge border accent (3px, status color),
  not a filled badge, circle, or colored card background — quieter and
  more consistent with the ledger/report aesthetic
- **Grid over gap**: adjacent cards/rows separated by hairline grid lines
  (1px `hairline` background showing through a 1px gap) rather than
  individual card borders with visible gaps between them
- **Index numbering**: small mono numbers (01, 02, 03...) may be used
  where the content has a genuine stable order (like the appliance card
  grid) — not decoratively, and not where order is arbitrary
- **Green is reserved** — brand accent and "good" status only. Don't
  reach for it as a general-purpose UI color (links, generic highlights,
  etc.) without deliberate reasoning

## Status → color mapping (unify with the Phase 2c rollup)

This maps directly onto the existing red/yellow/green rollup from Phase
2c's `computeApplianceRollup` — no changes to that logic, just the visual
tokens applied to its existing outputs:

| Rollup status | Token |
|---|---|
| Red (overdue) | `danger` |
| Yellow (needs info) | `warn` |
| Green (all good) | `pine` |
| Gray (no content) | `faint` |
| Amber ring overlay | `warn`, as a ring/outline rather than a fill |

## Rollout scope

This is a visual system, not a new phase of functional work — apply it
across the existing app (dashboard cards, appliance detail page,
onboarding) without changing any underlying logic, data flow, or
component structure. Treat it the same way you'd treat a CSS refactor:
should not touch `lib/rules-engine/`, `app/*/actions.ts`, or any
`data.ts` files.

## Suggested rollout order

1. Global tokens: Tailwind config + font setup, applied to `globals.css`
   and root layout
2. Dashboard card grid (the piece already validated in this doc's mockup)
3. Appliance detail page (Summary/Actions/History sections)
4. Onboarding flow (house details, appliance picker, confirmation)

## Handoff note for Claude Code

Good first prompt: "Apply the design system in
docs/design/design-system.md — start with the Tailwind config and font
setup only, no component changes yet. Stop there for review." Once tokens
are in place and confirmed, move to the dashboard card grid specifically,
since it's the piece already validated visually — treat it as the
reference implementation the other pages should match.
