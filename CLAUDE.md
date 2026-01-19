# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wren is a map-first photo scavenger hunt PWA. Players explore locations, snap photos at checkpoints, and see completed locations turn into photo pins on the map.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Vercel (hosting)
- Supabase or Vercel Postgres + Blob (database)
- Leaflet (map rendering)
- PWA (mobile-first)

## Architecture

The app supports two map modes:
- Real maps (OSM/Mapbox) with lat/lng coordinates
- Cartoon/illustrated maps (static images) with percentage-based positioning

Checkpoint validation types:
- **GPS_RADIUS**: Complete when within X meters of location
- **QR_CODE**: Scan QR code (for indoor spaces)
- **PHOTO_ONLY**: Photo submission without location check
- **MANUAL**: Tap to complete (accessibility fallback)

Key modules (planned):
- `lib/mapPlanner.ts` - clustering, bounds, zoom logic
- `lib/uiEngine.ts` - render model converting lat/lng to percentage positions
- `lib/validators/` - GPS, QR, Photo validators

## Design Principles

- Mobile-first, iPhone-optimized
- Two taps to submit a photo
- Big buttons, minimal text
- Fun over precision
