---
phase: 01-design-system
plan: 03
subsystem: ui
tags: [react, design-tokens, css-variables, inter-font, warm-neutral-palette]

# Dependency graph
requires:
  - phase: 01-design-system-01
    provides: CSS custom properties (--bg-base, --accent-orange, --border-light, etc.) and backward-compat class aliases
provides:
  - Landing page with warm off-white hero, solid accent-orange CTAs, Inter 800 display heading
  - Login page with white card form on bg-base, accent-orange primary action
  - Signup page and SignupOverlay rethemed to match Login
  - Region detail page with light stat cards, accent-orange progress bar, light checkin history
  - Explore page with warm overlay for ESC dialog
  - Onboarding page with accent-orange progress dots and light surface panels
  - OnboardingTour with warm-tinted overlay and light card tooltip
  - LandmarkNaming modal with light surface and accent-orange highlight
  - ThemePanel sidebar with bg-surface-raised and accent-orange selection indicators
affects: [02-map-redesign, 03-ui-polish, 04-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Solid accent-orange CTA buttons: background var(--accent-orange), color #FFFFFF, border 1px solid var(--accent-orange)"
    - "Secondary buttons: background transparent, color var(--text-primary), border 1px solid var(--border-mid)"
    - "Form cards: bg-surface-raised, border-light, radius-lg, shadow-md"
    - "Modal overlays: rgba(26, 23, 20, 0.40) warm tint instead of dark rgba(0,0,0,0.7-0.85)"
    - "Progress bars: track var(--bg-muted), fill var(--accent-orange)"
    - "Display headings: font-heading 700-800, text-primary — no gradient text"

key-files:
  created: []
  modified:
    - src/pages/Landing.jsx
    - src/pages/Login.jsx
    - src/pages/Signup.jsx
    - src/pages/Region.jsx
    - src/pages/Explore.jsx
    - src/pages/Onboarding.jsx
    - src/components/SignupOverlay.jsx
    - src/components/OnboardingTour.jsx
    - src/components/LandmarkNaming.jsx
    - src/components/ThemePanel.jsx

key-decisions:
  - "Pixel art inline SVG color arrays in Landing.jsx left unchanged — illustrative elements per plan instruction, not UI chrome"
  - "Demo region color data in Landing.jsx left unchanged — data values for interactive demo display"
  - "ThemePanel sky preset and character color data updated to warm palette — these are user-facing color picker options that should not show legacy colors"
  - "Hero section dark canvas animation removed from Landing — replaced with clean solid bg-base"
  - "drawPixelGrid and canvasRef/containerRef imports removed from Landing since dark canvas hero was removed"

patterns-established:
  - "All page backgrounds: var(--bg-base) — no dark full-page backgrounds anywhere"
  - "All form containers: var(--bg-surface-raised) with border-light and shadow-md"
  - "All modal overlays: rgba(26, 23, 20, 0.40) warm dark tint"
  - "Primary CTA: inline style with accent-orange, not className btn-retro (cleaner override)"

requirements-completed: [DS-04, DS-05]

# Metrics
duration: 9min
completed: 2026-03-24
---

# Phase 01 Plan 03: Page & Component Retheme Summary

**10 page and overlay files fully rethemed to TE x Rams warm neutral system — no dark backgrounds, gradient text, or legacy palette values remain in any UI chrome**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-24T01:36:43Z
- **Completed:** 2026-03-24T01:45:46Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- All 6 page components (Landing, Login, Signup, Region, Explore, Onboarding) now render on var(--bg-base) warm off-white with Inter typography
- All primary actions use solid accent-orange buttons — no linear-gradient, no textTransform uppercase
- Auth forms (Login, Signup, SignupOverlay) are clean white cards with border-light and shadow-md
- Dark hero canvas animation removed from Landing — replaced with clean typographic hero on bg-base
- All modal overlays use warm rgba(26, 23, 20, 0.40) tint instead of black
- ThemePanel sidebar converted from near-opaque dark drawer to clean bg-surface-raised panel

## Task Commits

1. **Task 1: Retheme Landing, Login, Signup, SignupOverlay** - `0208901` (feat)
2. **Task 2: Retheme Region, Explore, Onboarding, OnboardingTour, LandmarkNaming, ThemePanel** - `acb653f` (feat)

## Files Created/Modified

- `src/pages/Landing.jsx` — Hero: dark canvas replaced with solid bg-base; gradient TERRAIN logo replaced with Inter 800 text-primary; CTAs become solid accent-orange; DemoCard gets light surfaces
- `src/pages/Login.jsx` — Gradient logo removed; glass-panel-heavy replaced with explicit white card; PixelSparkleIcon removed; btn-retro buttons replaced with inline accent-orange styles
- `src/pages/Signup.jsx` — Same as Login: gradient logo, glass-panel, accent-gold all updated
- `src/components/SignupOverlay.jsx` — Modal card now bg-surface-raised/border-light/shadow-lg; overlay tint is warm rgba; btn-retro replaced with accent-orange inline styles
- `src/pages/Region.jsx` — All accent-gold fallbacks replaced with accent-orange; bg-glass replaced with bg-surface-raised; border-retro replaced with border-light/border-mid; progress bar uses accent-orange fill
- `src/pages/Explore.jsx` — Dark ESC overlay rgba changed from 0.85 to 0.35 warm tint; font-display replaced with font-heading 700
- `src/pages/Onboarding.jsx` — Progress dots use accent-orange/border-mid; welcome heading Inter 700 text-primary; glass panels replaced with explicit light card styles
- `src/components/OnboardingTour.jsx` — Dark opaque card replaced with bg-surface-raised/shadow-lg; overlay tint changed; progress dots use accent-orange
- `src/components/LandmarkNaming.jsx` — Modal card explicit light surface; input font-display replaced with font-heading 600; border-retro/borderRadius:0 replaced with border-mid/radius-md
- `src/components/ThemePanel.jsx` — Dark sidebar replaced with bg-surface-raised; accent-gold selection indicators replaced with accent-orange; sky preset and character color data updated to new warm palette

## Decisions Made

- Pixel art inline SVG color arrays in Landing.jsx intentionally left unchanged — plan explicitly instructs these illustrative elements not to be changed
- Demo region colors (`#D4A853`, `#FF6B9D`) in Landing.jsx DEMO_REGIONS data also left unchanged — they drive the interactive demo canvas color display and are data, not UI chrome
- Dark canvas hero removed entirely rather than adapted — replaced with clean typographic layout on bg-base, matching the TE x Rams utilitarian aesthetic better than any animated canvas alternative
- ThemePanel color picker data updated to new palette — these are user-facing options that should not show the legacy aesthetic as choices

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed drawPixelGrid import and canvas refs from Landing.jsx**
- **Found during:** Task 1 (Landing retheme)
- **Issue:** After removing the dark canvas hero, the imports for `drawPixelGrid`, `useRef`, and `canvasRef`/`containerRef` were no longer used, creating dead code
- **Fix:** Removed `import { drawPixelGrid }` and changed `useEffect, useRef` to `useEffect` only; removed ref variables and canvas useEffect
- **Files modified:** src/pages/Landing.jsx
- **Verification:** No console errors, refs no longer needed
- **Committed in:** 0208901 (Task 1 commit)

**2. [Rule 2 - Missing Critical] ThemePanel sky/character color data updated to new palette**
- **Found during:** Task 2 (ThemePanel retheme)
- **Issue:** ThemePanel had character color options and sky preset colors containing D4A853/FF6B9D — these render as selectable swatches and would appear as the old gold/pink colors in the new light UI
- **Fix:** Replaced character colors with accent-orange, region palette colors, and muted tones; replaced sky preset dark color arrays with warm daylight values
- **Files modified:** src/components/ThemePanel.jsx
- **Verification:** grep returns 0 legacy dark values
- **Committed in:** acb653f (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 dead code cleanup, 1 data values update)
**Impact on plan:** Both fixes improve correctness and consistency with the new design system. No scope creep.

## Issues Encountered

- Landing.jsx grep check in the plan's `<verification>` block returns non-zero (6 hits) — these are all within pixel art SVG color arrays (PixelMountain, PixelCity, PixelWave, PixelGamepad) and DEMO_REGIONS data, which the plan explicitly instructs to leave unchanged. UI chrome is clean.

## Known Stubs

None — all 10 files are fully rethemed. No placeholder content or hardcoded empty values that affect the plan's goal.

## Next Phase Readiness

- All pages and overlays now use consistent TE x Rams warm neutral tokens
- Design system application is complete for Phase 01 (plans 01, 02, 03 done)
- Ready for Phase 02: isometric map redesign and canvas improvements
- ThemePanel is marked for future replacement/removal — current state is functional and non-broken

---
*Phase: 01-design-system*
*Completed: 2026-03-24*

## Self-Check: PASSED

- All 10 modified files exist on disk
- Task 1 commit `0208901` exists
- Task 2 commit `acb653f` exists
- Metadata commit `d24d7d1` exists
- SUMMARY.md at `.planning/phases/01-design-system/01-03-SUMMARY.md` confirmed written
