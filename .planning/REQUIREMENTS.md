# Requirements: Terrain v2

**Defined:** 2026-03-23
**Core Value:** Tasks visualized as a world you're building

## v1 Requirements

### Design System

- [x] **DS-01**: Light color palette — off-white base (#F5F2ED), warm grays, orange accent (#E8712B)
- [x] **DS-02**: Typography system — Inter for body, strong weight hierarchy (48/32/24/20/16/14/12)
- [x] **DS-03**: Spacing system — 4px grid, consistent component rhythm
- [ ] **DS-04**: Component library — buttons, inputs, cards, modals follow TE x Rams aesthetic
- [x] **DS-05**: No decorative elements — every visual serves a function

### Map Canvas

- [ ] **MAP-01**: Isometric grid layout — regions render as 3D diorama tiles on canvas
- [ ] **MAP-02**: Four region biomes — mountains, forest, city, coast — each with distinct isometric art
- [ ] **MAP-03**: Region detail progression — tiles gain visual complexity as check-ins accumulate
- [ ] **MAP-04**: Weather overlays on tiles — clear/partial/cloudy/storm based on recency
- [ ] **MAP-05**: Smooth pan and zoom on canvas with mouse/touch
- [ ] **MAP-06**: Region labels and status indicators on hover/tap
- [ ] **MAP-07**: Canvas maintains 60fps with 10+ visible regions

### Layout

- [ ] **LAY-01**: List + Map dual panel — TODO list alongside map canvas
- [ ] **LAY-02**: Either panel collapsible — user can go full-map or full-list
- [ ] **LAY-03**: Region detail drawer — click region to see tasks, check-ins, milestones
- [ ] **LAY-04**: Responsive: mobile collapses to stacked layout with tab switching

### Inline Game

- [ ] **GAME-01**: Click region tile to launch platformer segment within map view
- [ ] **GAME-02**: Platformer renders in a focused overlay anchored to the region tile
- [ ] **GAME-03**: Collectible orbs from past check-in notes within each region zone
- [ ] **GAME-04**: ESC or tap-outside to exit back to map view
- [ ] **GAME-05**: Physics: gravity, jump, move, sprint — existing engine adapted to inline context

### Productivity UX

- [ ] **PROD-01**: Quick-add task from anywhere (keyboard shortcut or persistent input)
- [ ] **PROD-02**: Task states: todo, in-progress, done — with clear visual indicators
- [ ] **PROD-03**: Check-in flow streamlined — fewer clicks, inline on task list
- [ ] **PROD-04**: Field Reports appear contextually in region drawer, not separate panel
- [ ] **PROD-05**: Onboarding creates first 3 regions with clear productivity framing

### Landing Page

- [ ] **LAND-01**: Landing page redesigned — clean, bright, TE x Rams aesthetic
- [ ] **LAND-02**: Isometric map preview — interactive demo or animated illustration
- [ ] **LAND-03**: Clear value prop: "Your goals, visualized as a world you build"
- [ ] **LAND-04**: Mobile-optimized landing

## v2 Requirements

### Audio & Atmosphere

- **AUD-01**: Ambient soundscapes per biome
- **AUD-02**: Interaction sound effects (check-in ding, level-up chime)

### Social

- **SOC-01**: Share map snapshot as image
- **SOC-02**: Public profile with read-only map view

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom uploaded illustrations | All art procedurally drawn on canvas — no asset pipeline |
| Dark mode | New design direction is explicitly light-base; revisit if requested |
| Real-time collaboration | Single-user productivity tool |
| Native mobile app | Web-first, responsive design |
| Music/audio | Deferred to v2 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DS-01 | Phase 1 | Complete |
| DS-02 | Phase 1 | Complete |
| DS-03 | Phase 1 | Complete |
| DS-04 | Phase 1 | Pending |
| DS-05 | Phase 1 | Complete |
| MAP-01 | Phase 2 | Pending |
| MAP-02 | Phase 2 | Pending |
| MAP-03 | Phase 2 | Pending |
| MAP-04 | Phase 2 | Pending |
| MAP-05 | Phase 2 | Pending |
| MAP-06 | Phase 2 | Pending |
| MAP-07 | Phase 2 | Pending |
| LAY-01 | Phase 2 | Pending |
| LAY-02 | Phase 2 | Pending |
| LAY-03 | Phase 2 | Pending |
| LAY-04 | Phase 2 | Pending |
| GAME-01 | Phase 3 | Pending |
| GAME-02 | Phase 3 | Pending |
| GAME-03 | Phase 3 | Pending |
| GAME-04 | Phase 3 | Pending |
| GAME-05 | Phase 3 | Pending |
| PROD-01 | Phase 3 | Pending |
| PROD-02 | Phase 3 | Pending |
| PROD-03 | Phase 3 | Pending |
| PROD-04 | Phase 3 | Pending |
| PROD-05 | Phase 3 | Pending |
| LAND-01 | Phase 4 | Pending |
| LAND-02 | Phase 4 | Pending |
| LAND-03 | Phase 4 | Pending |
| LAND-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after initial definition*
