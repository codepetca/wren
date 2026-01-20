# Scurry Development Journal

## 2026-01-19 - Project Setup & Planning

### What was done
- Initialized git repository, connected to GitHub remote
- Created initial CLAUDE.md with project overview
- Defined MVP scope: Solo Player Demo
- Set up AI guidance structure (Pika-style)

### Decisions made
- **Database**: Convex (familiar, realtime built-in, good for photo storage)
- **Map mode**: Real maps (Leaflet/OSM) first, cartoon maps later
- **MVP validation**: Photo-only (no GPS requirement for easier testing)
- **MVP scope**: Single player, one hardcoded race, 5-6 POIs
- **Approach**: Build engines first as standalone testable modules

### MVP definition
1. Map with blank pins
2. Tap pin → see clue → take photo
3. Pin transforms to show thumbnail
4. Complete all → celebration screen with photo grid

### Next steps
- Initialize Next.js + Convex
- Build map planner engine with tests
- Build validators engine with tests
- Create mock race data

---

## 2026-01-19 - Phase 1 Implementation

### What was done
- Initialized Next.js 14+ with App Router and TypeScript
- Set up Convex with schema (races, pois, completions)
- Added Vitest for testing
- Created ConvexClientProvider component
- Defined core types in `/lib/types.ts`
- Created GitHub issue #1 for MVP roadmap

### Files created
- `convex/schema.ts` - Database schema
- `convex/tsconfig.json` - Convex TypeScript config
- `src/components/ConvexClientProvider.tsx` - Convex React provider
- `lib/types.ts` - Core TypeScript types
- `lib/index.ts` - Lib exports
- `vitest.config.ts` - Test configuration
- `.env.example` - Environment variable template

### Next steps
- Add Leaflet dependency
- Build map planner engine (TDD)
- Build validators engine (TDD)
- Create Convex queries and mutations

---
