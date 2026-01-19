# Wren AI Agent Onboarding

Start every session by reading this file.

## Required Reading Order

Read these documents before writing any code:

1. `CLAUDE.md` — Project overview and tech stack
2. `docs/architecture.md` — System design, engines, data flow
3. `docs/conventions.md` — Code patterns and constraints
4. `.ai/features.json` — Current feature status (source of truth)
5. `.ai/JOURNAL.md` — Recent session history

## Before Starting Work

1. Check `.ai/features.json` for current status
2. Review recent entries in `.ai/JOURNAL.md`
3. Run `git status` to understand current state
4. State your task and approach before coding

## During Work

- **TDD**: Write tests first for engine/utility code
- **Keep UI thin**: Business logic belongs in `/lib`, not components
- **No unnecessary dependencies**: Ask before adding packages
- **Small commits**: Commit working increments

## After Work

Update these files before ending session:

1. `.ai/JOURNAL.md` — Add entry with what was done, decisions made, blockers
2. `.ai/features.json` — Update status of features worked on
3. Commit all changes

## Project Constraints

- Next.js 14+ with App Router (never Pages Router)
- Convex for database and file storage
- TypeScript strict mode
- Leaflet for maps (MVP uses real maps, cartoon maps later)
- Mobile-first, PWA-optimized
- No auth in MVP (single player demo)

## Key Directories

```
/app          → Next.js pages and routes
/lib          → Pure TypeScript engines (mapPlanner, validators)
/convex       → Convex schema, queries, mutations
/components   → React components (thin, presentational)
```
