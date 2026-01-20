# Scurry Code Conventions

## Technology Constraints

### Required
- Next.js 14+ with App Router
- TypeScript in strict mode
- Convex for database and file storage
- Leaflet for map rendering
- Vitest for testing

### Prohibited
- Pages Router (use App Router only)
- External component libraries (build custom)
- OAuth or complex auth (MVP has no auth)
- Server-side sessions (use localStorage for visitorId)

## Code Organization

### Directory Structure
```
/app                    → Routes and pages (thin)
/components             → React components (presentational)
/lib                    → Pure TypeScript modules (engines)
/lib/__tests__          → Unit tests for engines
/convex                 → Schema, queries, mutations
```

### Engine Code (`/lib`)
- Pure functions only, no React
- No side effects (no fetch, no localStorage)
- Fully typed inputs and outputs
- Each function does one thing
- Export from index file

```typescript
// Good
export function calculateBounds(pois: POI[]): Bounds {
  // pure calculation
}

// Bad - side effect
export function calculateBounds(pois: POI[]): Bounds {
  console.log('calculating...'); // no side effects
  fetch('/api/log', ...);        // no network calls
}
```

### Component Code (`/components`)
- Thin wrappers around engines
- State management via props or Convex hooks
- No business logic in components
- Use composition over inheritance

```typescript
// Good - thin component
function PinMarker({ poi, isComplete, onTap }: Props) {
  return (
    <Marker position={[poi.lat, poi.lng]} onClick={() => onTap(poi)}>
      {isComplete ? <PhotoIcon /> : <BlankIcon />}
    </Marker>
  );
}

// Bad - logic in component
function PinMarker({ poi, completions }: Props) {
  const isComplete = completions.some(c => c.poiId === poi._id); // move to parent
  const distance = haversine(userLat, userLng, poi.lat, poi.lng); // move to engine
}
```

## Testing

### TDD for Engines
Write tests first for all `/lib` code.

```typescript
// lib/__tests__/mapPlanner.test.ts
describe('calculateBounds', () => {
  it('returns correct bounds for single POI', () => {
    const pois = [{ lat: 43.65, lng: -79.38 }];
    const bounds = calculateBounds(pois);
    expect(bounds.north).toBe(43.65);
  });
});
```

### Test File Naming
- `*.test.ts` for unit tests
- `*.spec.ts` for integration tests (post-MVP)

## TypeScript

### Type Definitions
Define shared types in `/lib/types.ts`.

```typescript
export interface POI {
  _id: string;
  lat: number;
  lng: number;
  clue: string;
  validationType: ValidationType;
}

export type ValidationType = 'PHOTO_ONLY' | 'GPS_RADIUS' | 'QR_CODE' | 'MANUAL';

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
```

### Convex Types
Use Convex's generated types. Don't duplicate.

```typescript
import { Doc, Id } from '../convex/_generated/dataModel';

type Race = Doc<'races'>;
type POIId = Id<'pois'>;
```

## Naming

| Thing | Convention | Example |
|-------|------------|---------|
| Files | camelCase | `mapPlanner.ts` |
| Components | PascalCase | `MapScreen.tsx` |
| Functions | camelCase | `calculateBounds` |
| Types/Interfaces | PascalCase | `Bounds`, `POI` |
| Constants | SCREAMING_SNAKE | `MAX_ZOOM_LEVEL` |
| Convex tables | plural, lowercase | `races`, `pois` |

## Git

### Commit Messages
```
<type>: <short description>

Types: feat, fix, refactor, test, docs, chore
```

### Branch Names (post-MVP)
```
feat/map-planner
fix/pin-rendering
```
