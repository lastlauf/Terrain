# Terrain v2 — Retheme & Redesign

## What This Is

Terrain is a goal operating system that visualizes life goals as a living, illustrated map. Users create regions (goal areas), check in on progress, and watch their world build up over time. It reads as a TODO app with a fun isometric map — productivity-first with gamified visual rewards. The platformer mini-game runs inline within map regions.

## Core Value

**Tasks visualized as a world you're building.** Every check-in adds detail to your map. The map IS the progress indicator — not a decoration beside a list.

## Requirements

### Validated

- ✓ Supabase Auth (email/password + magic link) — existing
- ✓ Database schema (profiles, regions, checkins, milestones, field_reports, collected_notes) — existing
- ✓ Region CRUD (create, read, update, delete) — existing
- ✓ Check-in logging — existing
- ✓ Field Reports via Claude API — existing
- ✓ Weather system based on check-in recency — existing
- ✓ Theme panel — existing
- ✓ Platformer explore mode — existing
- ✓ Vercel deployment — existing

### Active

- [ ] Retheme entire UI: dark retro-pixel → clean, bright Teenage Engineering x Dieter Rams aesthetic
- [ ] White/warm gray base palette with warm neutral accents (off-white, warm grays, orange accent)
- [ ] Replace procedural pixel canvas with illustrated isometric diorama-style region tiles
- [ ] Isometric tiles per region type: mountains, forest, city, coast — detailed, hand-drawn style
- [ ] Regions build up visual detail as milestones/check-ins accumulate
- [ ] List + Map layout: TODO list visible alongside map, either side collapsible
- [ ] Inline mini-game: click a region tile to play platformer segment directly on the map
- [ ] Productivity-focused UX: clear task hierarchy, actionable language, focused flows
- [ ] Typography refresh: clean sans-serif system (Inter or similar), strong hierarchy
- [ ] Landing page redesign to match new visual direction
- [ ] Mobile-optimized responsive layout
- [ ] Onboarding flow polish for new aesthetic

### Out of Scope

- Native mobile app — web-first, responsive
- Real-time collaboration — single-user tool
- Social features / sharing — personal productivity focus
- Custom illustrated assets — use canvas-drawn isometric tiles, not imported art files
- Music/sound — defer to future version

## Context

Terrain v1 is fully built and deployed at terrain-app.vercel.app. The current aesthetic is dark canvas with retro-pixel art, 90s kitschy fonts (Daydream), and gradient buttons. The retheme is a full visual overhaul while keeping the existing data layer, auth, and core logic intact.

**Reference art direction:** Isometric diorama illustrations — detailed terrain tiles with cabin, coast, rocks, vegetation. Think illustrated board game tiles, not pixel art. Clean edges, natural colors, slight paper texture feel.

**Design language:** Teenage Engineering (warm industrial, orange accents, grid systems, utilitarian beauty) meets Dieter Rams (less but better, honest materials, no decoration for decoration's sake). The result should feel like a high-end productivity tool that happens to have a beautiful illustrated map.

**Tech stack (unchanged):** React + Vite, Supabase, Anthropic Claude API, HTML5 Canvas, React Router v6.

## Constraints

- **Existing data**: Must not break existing database schema or user data
- **Canvas rendering**: Isometric tiles rendered via HTML5 Canvas — no external illustration files, all procedurally drawn
- **Performance**: Map canvas must maintain 60fps with 10+ regions visible
- **Auth**: Supabase Auth flow must remain functional throughout retheme
- **Deployment**: Must continue deploying cleanly to Vercel

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| White/warm gray base instead of dark | TE x Rams aesthetic, cleaner, more professional | — Pending |
| Isometric diorama tiles instead of pixel terrain | Reference art direction, more illustrative and rewarding | — Pending |
| List + Map collapsible layout | Productivity-first but map stays central | — Pending |
| Inline mini-game instead of separate route | "Play while building" — no context switch | — Pending |
| Canvas-drawn isometric (no imported art) | Keep everything self-contained, no asset pipeline | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-23 after initialization*
