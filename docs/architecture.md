# Wren Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                       │
│  ┌───────────┐  ┌───────────┐  ┌───────────────┐   │
│  │ Map Screen│  │ POI Modal │  │Complete Screen│   │
│  └─────┬─────┘  └─────┬─────┘  └───────────────┘   │
│        │              │                             │
│  ┌─────┴──────────────┴─────┐                      │
│  │       Components         │ (thin, presentational)│
│  └─────────────┬────────────┘                      │
│                │                                    │
│  ┌─────────────┴────────────┐                      │
│  │     Engines (/lib)       │ (pure TS, tested)    │
│  │  • mapPlanner            │                      │
│  │  • validators            │                      │
│  └─────────────┬────────────┘                      │
│                │                                    │
└────────────────┼────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │     Convex      │
        │  • Races        │
        │  • POIs         │
        │  • Completions  │
        │  • File Storage │
        └─────────────────┘
```

## Data Model (Convex)

### Race
```typescript
{
  _id: Id<"races">,
  name: string,           // "Downtown Discovery"
  description: string,
  bounds: {               // Pre-calculated for map centering
    north: number,
    south: number,
    east: number,
    west: number
  }
}
```

### POI (Point of Interest)
```typescript
{
  _id: Id<"pois">,
  raceId: Id<"races">,
  order: number,          // Display order (optional)
  lat: number,
  lng: number,
  clue: string,           // "Find the red bench near the fountain"
  validationType: "PHOTO_ONLY" | "GPS_RADIUS" | "QR_CODE" | "MANUAL",
  validationConfig?: {    // Type-specific config
    radiusMeters?: number,
    qrValue?: string
  }
}
```

### Completion
```typescript
{
  _id: Id<"completions">,
  visitorId: string,      // Anonymous session ID (no auth in MVP)
  poiId: Id<"pois">,
  photoId: Id<"_storage">, // Convex file storage reference
  completedAt: number     // Timestamp
}
```

## Engines

### Map Planner (`/lib/mapPlanner.ts`)

Pure functions for map calculations. No side effects, no dependencies.

```typescript
// Calculate bounding box from POI array
calculateBounds(pois: POI[]): Bounds

// Calculate optimal zoom level for bounds
calculateZoom(bounds: Bounds, mapSize: { width: number, height: number }): number

// Group distant POIs into map legs (post-MVP)
clusterIntoLegs(pois: POI[], maxDistanceKm: number): POI[][]
```

### Validators (`/lib/validators/`)

Each validator is a pure function returning boolean.

```typescript
// Always returns true (MVP default)
photoOnly(): boolean

// Check if user is within radius of POI
gpsRadius(userLat: number, userLng: number, poiLat: number, poiLng: number, radiusMeters: number): boolean

// Compare scanned QR value
qrCode(scanned: string, expected: string): boolean

// Always returns true (accessibility fallback)
manual(): boolean
```

## Data Flow

### Completing a Checkpoint

```
1. User taps blank pin
2. POI Modal opens with clue
3. User takes photo
4. Photo uploads to Convex storage → returns photoId
5. Completion record created (visitorId, poiId, photoId)
6. Map re-renders, pin shows thumbnail
7. If all POIs complete → navigate to Complete Screen
```

### Map Initialization

```
1. Fetch race + POIs from Convex
2. Fetch completions for current visitorId
3. Calculate bounds with mapPlanner
4. Initialize Leaflet map centered on bounds
5. Render pins (blank or completed based on completions)
```

## Session Management (MVP)

No authentication. Use a random `visitorId` stored in localStorage.

```typescript
// On app load
const visitorId = localStorage.getItem('wren_visitor_id')
  ?? crypto.randomUUID();
localStorage.setItem('wren_visitor_id', visitorId);
```

"Play again" clears completions for this visitorId or generates a new one.
