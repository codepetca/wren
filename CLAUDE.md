# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Start Here

Read `.ai/START-HERE.md` for full onboarding. Required reading order:

1. `CLAUDE.md` (this file)
2. `docs/architecture.md` — System design, data model, engines
3. `docs/conventions.md` — Code patterns and constraints
4. `.ai/features.json` — Current feature status
5. `.ai/JOURNAL.md` — Recent session history

## Project Overview

Wren is a map-first photo scavenger hunt PWA. Players explore locations, snap photos at checkpoints, and see completed locations turn into photo pins on the map.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Convex (database + file storage)
- Leaflet (map rendering)
- Vitest (testing)
- Vercel (hosting)

## Architecture

Two map modes (real maps first, cartoon maps later):
- Real maps (OSM/Leaflet) with lat/lng coordinates
- Cartoon maps (static images) with percentage-based positioning

Checkpoint validation types:
- **PHOTO_ONLY**: Photo submission without location check (MVP default)
- **GPS_RADIUS**: Complete when within X meters of location
- **QR_CODE**: Scan QR code (for indoor spaces)
- **MANUAL**: Tap to complete (accessibility fallback)

Key modules:
- `/lib/mapPlanner.ts` — bounds, zoom calculations
- `/lib/validators/` — validation logic
- `/convex/` — schema, queries, mutations

## Constraints

- App Router only (no Pages Router)
- TDD for engine code
- Keep components thin (logic in `/lib`)
- No auth in MVP (use localStorage visitorId)

## Current Milestone

MVP: Solo Player Demo — see `.ai/features.json` for status
