# Landing page

**Status:** Design approved (see reference file), not yet built
**Depends on:** Design system v2 (complete)

## Goal

A standalone marketing route at `/` — the first thing anyone sees before
entering the app — separate from `/onboarding`, which remains the
functional entry point.

## Reference material

`docs/designs/reference/landing-page-preview-v2.html` is the approved
static reference — a throwaway mockup, not production code. Rebuild each
section as a proper component using the app's existing design-system-v2
tokens and any existing shared components, don't copy-paste the raw HTML.
Every color, spacing, and type value in the reference file should map to
an existing token (navy/navy-deep, accent/accent-soft, amber/amber-soft,
danger/good, ink/ink-muted/ink-faint, line/line-soft, paper) — if
something in the reference doesn't map cleanly, flag it rather than
inventing a new one-off value.

## In scope

- New route at `/` (root), replacing whatever the current default/scaffold
  page is there
- **Nav bar**: logo mark + wordmark, anchor links to `#how-it-works` and
  `#value`, CTA button — sticky on scroll, per the reference
- **Hero**: full-bleed photo (self-hosted, see below), text directly on
  the photo (no panel/scrim — text-shadow only, per the final direction),
  eyebrow/headline/subtext/CTA/photo-credit
- **"How it works"**: 3 alternating steps, each with real copy + a small
  static illustrative preview of the actual product (chip picker,
  dashboard status cards, contractor-voice content) — these previews are
  decorative/illustrative, not wired to live data
- **"Why it helps"**: the 4 value-prop cards, in a 4-column grid
  (2-column on mobile)
- **Closing CTA band**: solid navy, headline + subtext + CTA
- **Footer**: minimal, single line
- Section-level background color blocking (accent-soft tint behind "How
  it works", plain paper behind "Why it helps", line-soft tint on footer)
- Both CTA buttons (nav + hero + closing — three total) link to
  `/onboarding`

## Out of scope (explicitly deferred)

- Any auth/sign-up flow — all CTAs go to `/onboarding` for now. Revisit
  once Phase 5 (real auth) exists
- Making the nav bar shared/global across other pages — this nav is
  specific to `/` for now, not something dashboard/onboarding need too
  unless decided separately
- Any additional marketing sections beyond what's in the reference
  (testimonials, pricing, etc.)

## Hero photo

Self-hosted, not hotlinked. Source: Unsplash, "Brown wooden house with
green grass field" by Bailey Anselme (@pbanselme), shot in Glenwood,
Iowa, published May 2019, free to use under the Unsplash License.
Traditional-style home with warm sunset lighting.
Page: https://unsplash.com/photos/brown-wooden-house-with-green-grass-field-Bkp3gLygyeA
File should be downloaded and placed under `/public` (e.g.
`public/hero-home.jpg`), referenced via `next/image` — not a raw `<img>`
or CSS `background-image` the way the static reference does it. Include a
small, unobtrusive photo credit line near the hero, matching the
reference. No scrim/panel behind the hero text — legibility comes from
text-shadow only.

## Spacing notes (already audited in the reference file)

The reference file has already been through a spacing pass — asymmetric
margin/padding stacking around the last "how it works" step was found and
fixed, and a non-semantic empty spacer paragraph was replaced with a real
margin. Carry these fixes forward; don't reintroduce either issue when
rebuilding as components.

## Acceptance criteria

- [ ] `/` renders all sections described above, matching the reference
      file's structure and copy
- [ ] Hero photo is self-hosted via `next/image`, not hotlinked
- [ ] All three CTAs navigate to `/onboarding`
- [ ] Nav anchor links scroll to the correct sections
- [ ] Responsive down to mobile (nav links hide, grids collapse, per the
      reference's existing media query logic)
- [ ] Uses only existing design-system-v2 tokens — no new colors/fonts
      introduced
- [ ] Works on the deployed Vercel URL
- [ ] `BUILDLOG.md` has an entry for this

## Handoff note for Claude Code

Good first prompt: "Build the landing page at the root route ('/') using
docs/designs/reference/landing-page-preview-v2.html as the reference —
rebuild each section as a proper component using existing
design-system-v2 tokens, not copy-pasted HTML. I've already placed the
real hero photo at public/hero-home.jpg — use next/image to reference it
instead of the reference file's CSS background-image approach. Stop after
the nav bar and hero are done for review before continuing to the
remaining sections."
