# Roadmap: Terrain v2 — Retheme & Redesign

## Overview

Terrain v2 is a full visual overhaul of an existing goal-tracking app. The dark retro-pixel aesthetic becomes a clean, bright Teenage Engineering x Dieter Rams system — white base, warm grays, orange accent, and illustrated isometric map tiles. The work moves in a natural dependency order: establish the design system first, then build the map canvas and layout, then layer in the inline game and productivity UX, then ship the new landing page.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design System** - Establish the visual language — palette, type, spacing, components
- [ ] **Phase 2: Map & Layout** - Isometric canvas and dual-panel layout replace the old map
- [ ] **Phase 3: Game & Productivity UX** - Inline platformer and streamlined task workflows
- [ ] **Phase 4: Landing Page** - Public-facing redesign to match the new direction

## Phase Details

### Phase 1: Design System
**Goal**: The foundational visual language is in place — every component speaks TE x Rams
**Depends on**: Nothing (first phase)
**Requirements**: DS-01, DS-02, DS-03, DS-04, DS-05
**Success Criteria** (what must be TRUE):
  1. The app renders on a warm off-white (#F5F2ED) base with orange accent throughout — no dark backgrounds remain
  2. All text uses Inter with the defined weight hierarchy — no legacy fonts (Daydream or similar) appear anywhere
  3. Buttons, inputs, cards, and modals all follow the same visual system — consistent radius, spacing, and color usage
  4. Spacing is visibly grid-consistent — no rogue padding or margins that break the 4px rhythm
  5. There are no purely decorative elements — gradients, drop shadows, and flourishes from the old theme are gone
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — CSS design tokens, global styles, HTML font setup (Wave 1)
- [ ] 01-02-PLAN.md — Core components: Navbar, modals, DashboardView (Wave 2)
- [ ] 01-03-PLAN.md — Pages: Landing, Login, Signup, Region, Explore, Onboarding (Wave 2)

### Phase 2: Map & Layout
**Goal**: The isometric diorama map and dual-panel layout define the core user experience
**Depends on**: Phase 1
**Requirements**: MAP-01, MAP-02, MAP-03, MAP-04, MAP-05, MAP-06, MAP-07, LAY-01, LAY-02, LAY-03, LAY-04
**Success Criteria** (what must be TRUE):
  1. Regions render as isometric 3D tiles — mountains, forest, city, and coast biomes are visually distinct
  2. A region with more check-ins shows more visual detail on its tile than one with none
  3. Weather overlays (clear/partial/cloudy/storm) are visible on tiles and change based on check-in recency
  4. The user can pan and zoom the canvas smoothly with mouse and touch — no jank at 10+ regions
  5. The TODO list and map panel sit side-by-side, either panel can be collapsed, and mobile shows a stacked/tabbed layout
**Plans**: TBD

### Phase 3: Game & Productivity UX
**Goal**: The inline platformer and streamlined task workflows make Terrain feel like a cohesive tool
**Depends on**: Phase 2
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, PROD-01, PROD-02, PROD-03, PROD-04, PROD-05
**Success Criteria** (what must be TRUE):
  1. Clicking a region tile opens a platformer segment as a focused overlay anchored to that tile — no page navigation
  2. The platformer contains collectible orbs drawn from the region's check-in notes, and ESC or tapping outside closes it
  3. A task can be added from anywhere in the app with a keyboard shortcut or persistent input — no navigating to a form
  4. Tasks show clear todo/in-progress/done state visually, and checking in requires no more than 2 clicks from the task list
  5. First-time users are walked through creating 3 regions with language framed around goals and productivity
**Plans**: TBD

### Phase 4: Landing Page
**Goal**: The public landing page communicates the new direction and invites users in
**Depends on**: Phase 3
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04
**Success Criteria** (what must be TRUE):
  1. The landing page matches the Phase 1 design system — same palette, type, and component language as the app
  2. A visitor sees the value proposition ("Your goals, visualized as a world you build") clearly on first view
  3. An isometric map preview is visible on landing — either interactive or animated
  4. The landing page is fully usable on a 375px mobile screen with no overflow or broken layout
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design System | 0/3 | Not started | - |
| 2. Map & Layout | 0/TBD | Not started | - |
| 3. Game & Productivity UX | 0/TBD | Not started | - |
| 4. Landing Page | 0/TBD | Not started | - |
