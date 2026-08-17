# Design handoff — home setup flow + dashboard

Reference mockups (static HTML, view in browser to see real behavior/hover states):
- `add-your-house-form.html` — Setup step 1 (address, ZIP, house type)
- `add-your-house-step2.html` — Setup step 2 (systems/exterior/appliances/safety chip picker)
- `dashboard.html` — Home dashboard (needs-attention cards + category cards)

These are throwaway mockups, not production code — don't copy-paste the raw HTML into the app.
Rebuild each pattern below as a proper component using the existing component structure, and wire
it to real data instead of the placeholder content in the HTML files.

---

## 1. Tokens — add to `tailwind.config.js`

```js
// theme.extend in tailwind.config.js
colors: {
  navy: {
    DEFAULT: '#16294f',
    deep: '#0d1a33',
  },
  accent: {
    DEFAULT: '#2f5fd8',
    soft: '#eaf0fe',
  },
  amber: {
    DEFAULT: '#b9720c',
    soft: '#fdf1de',
    line: '#f2ddb3',
  },
  ink: {
    DEFAULT: '#16192a',
    muted: '#5b6072',
    faint: '#9195a5',
  },
  line: {
    DEFAULT: '#dfe2ea',
    soft: '#eceef4',
  },
  paper: '#fbfbfd',
},
borderRadius: {
  card: '12px',
  control: '10px',
},
```

Type scale used throughout: page title 28–30px/700, section title 15px/700, body/label 14–15px/600,
meta/caption 12–12.5px/400–600. Font stack: system default (`-apple-system, "Inter", "Segoe UI", ...`).

---

## 2. Component patterns

### Primary button
Full-width, navy, used for the one main action per screen (never paired with an equal-weight secondary button).
```
h-[52px] w-full rounded-control bg-navy-deep text-white font-semibold
hover:bg-navy active:translate-y-px transition
```

### Back navigation
Not a button — a quiet text link with a left-nudging chevron on hover. Sits above the primary button, not beside it.
```
inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink
[&_svg]:hover:-translate-x-0.5 [&_svg]:transition
```

### Text input
```
h-12 w-full rounded-control border-[1.5px] border-line px-4 text-[15px]
placeholder:text-[#a7abbb]
focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft
```

### Radio option (step 1 house type) — full-row selectable card, not a bare radio dot
```
Container: rounded-control border-[1.5px] border-line px-4 h-[50px] flex items-center gap-3
Checked state: border-accent bg-accent-soft ring-4 ring-accent-soft
Dot: 18px circle, border-[1.5px] border-[#c3c8d6], fills solid accent when checked
```

### Chip / multi-select toggle (step 2 systems/exterior/etc.)
Pill-shaped, checkbox-backed, with an inline check-dot that fills on select.
```
Container: inline-flex items-center gap-1.5 h-10 rounded-full border-[1.5px] border-line px-4 text-sm font-medium
Checked state: border-accent bg-accent-soft text-navy-deep
Check dot: 15px circle, border-[#c3c8d6] → fills accent + white checkmark svg when checked
```
Group chips under section labels (Systems / Exterior / Appliances / Safety) with `flex flex-wrap gap-2.5`.

### Status pill ("Needs info")
```
inline-flex items-center gap-1.5 rounded-full border border-amber-line bg-amber-soft
px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber
+ small 5px solid dot in amber before the text
```
This is a status token, not a one-off — reuse it for any future state (e.g. "Overdue" in red, "Up to date" in green) by swapping the color trio (text/bg/border), keeping the same shape and dot.

### Attention card (dashboard, "needs your attention")
Left-accented card (3px amber border-left), icon badge top-right, index number top-left, title, status pill at the bottom. Whole card is a link/button to the item's detail view.
```
rounded-card border border-line border-l-[3px] border-l-amber bg-white p-[18px]
hover:shadow-md hover:-translate-y-px transition
```

### Category card (dashboard)
Icon badge + name + meta text, horizontal layout, whole card clickable.
```
flex items-center gap-3 rounded-card border-[1.5px] border-line bg-white p-4
hover:border-accent hover:shadow-md hover:-translate-y-px transition
```
Icon badge: 38px rounded-[9px] bg-accent-soft text-accent, centered icon.

**Design debt flagged in the mockup** — the category card's meta text should be status-driven (e.g. "2 of 7 need info") not a raw item count once real data is wired up. See design critique below.

---

## 3. Open design notes for the real dashboard (not yet resolved in the mockup)

The dashboard mockup was explicitly critiqued as an *onboarding-empty-state*, not a finished returning-user dashboard. Before building the production version, decide on:

1. A home-health summary at the top (e.g. completion ring or "3 tasks need attention" banner) so the page isn't empty once setup is done.
2. Per-category status instead of raw counts — "2 of 7 need info" beats "7 items."
3. Time/due-date surfacing somewhere on the page — next-due task, overdue flags, last-checked dates. Currently nothing on the dashboard communicates *when*.
4. Whether "Needs attention" and "Categories" should have different visual weight (attention items are time-sensitive; categories are static navigation).

Recommend treating the current mockup as the **setup-complete / empty state** and designing a second, denser **returning-user dashboard** state on top of it.

---

## How to hand this to Claude Code

Point your Claude Code instance at this file plus the three HTML mockups (drop all four into the repo, e.g. under `design/`, or just paste this markdown into the chat). Ask it to:
- Add the token block to `tailwind.config.js`
- Build/update components for: primary button, back-link, text input, radio-card, chip, status pill, attention card, category card
- Apply them to the real setup flow and dashboard views, wired to actual backend data (not the placeholder copy/counts in the mockups)
- Treat section 3 above as open product questions to resolve with you before building the "real" dashboard, not something to guess at
