<!-- GSD:project-start source:PROJECT.md -->
## Project

**Terrain v2 — Retheme & Redesign**

Terrain is a goal operating system that visualizes life goals as a living, illustrated map. Users create regions (goal areas), check in on progress, and watch their world build up over time. It reads as a TODO app with a fun isometric map — productivity-first with gamified visual rewards. The platformer mini-game runs inline within map regions.

**Core Value:** **Tasks visualized as a world you're building.** Every check-in adds detail to your map. The map IS the progress indicator — not a decoration beside a list.

### Constraints

- **Existing data**: Must not break existing database schema or user data
- **Canvas rendering**: Isometric tiles rendered via HTML5 Canvas — no external illustration files, all procedurally drawn
- **Performance**: Map canvas must maintain 60fps with 10+ regions visible
- **Auth**: Supabase Auth flow must remain functional throughout retheme
- **Deployment**: Must continue deploying cleanly to Vercel
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
