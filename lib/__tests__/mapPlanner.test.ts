import { describe, it, expect } from "vitest";
import { calculateBounds, calculateZoom, calculateCenter } from "../mapPlanner";
import type { Coordinate, Bounds, MapSize } from "../types";

describe("calculateBounds", () => {
  it("returns correct bounds for a single POI", () => {
    const pois: Coordinate[] = [{ lat: 43.65, lng: -79.38 }];
    const bounds = calculateBounds(pois);

    expect(bounds.north).toBe(43.65);
    expect(bounds.south).toBe(43.65);
    expect(bounds.east).toBe(-79.38);
    expect(bounds.west).toBe(-79.38);
  });

  it("returns correct bounds for multiple POIs", () => {
    const pois: Coordinate[] = [
      { lat: 43.65, lng: -79.38 },
      { lat: 43.70, lng: -79.40 },
      { lat: 43.60, lng: -79.35 },
    ];
    const bounds = calculateBounds(pois);

    expect(bounds.north).toBe(43.70);
    expect(bounds.south).toBe(43.60);
    expect(bounds.east).toBe(-79.35);
    expect(bounds.west).toBe(-79.40);
  });

  it("throws error for empty array", () => {
    expect(() => calculateBounds([])).toThrow("At least one coordinate required");
  });
});

describe("calculateCenter", () => {
  it("returns center of bounds", () => {
    const bounds: Bounds = {
      north: 43.70,
      south: 43.60,
      east: -79.35,
      west: -79.45,
    };
    const center = calculateCenter(bounds);

    expect(center.lat).toBeCloseTo(43.65);
    expect(center.lng).toBeCloseTo(-79.40);
  });
});

describe("calculateZoom", () => {
  it("returns higher zoom for small bounds", () => {
    const smallBounds: Bounds = {
      north: 43.651,
      south: 43.650,
      east: -79.380,
      west: -79.381,
    };
    const mapSize: MapSize = { width: 400, height: 600 };
    const zoom = calculateZoom(smallBounds, mapSize);

    // Small area should have high zoom (closer view)
    expect(zoom).toBeGreaterThanOrEqual(16);
  });

  it("returns lower zoom for large bounds", () => {
    const largeBounds: Bounds = {
      north: 44.0,
      south: 43.0,
      east: -79.0,
      west: -80.0,
    };
    const mapSize: MapSize = { width: 400, height: 600 };
    const zoom = calculateZoom(largeBounds, mapSize);

    // Large area should have low zoom (farther view)
    expect(zoom).toBeLessThanOrEqual(10);
  });

  it("clamps zoom to valid range", () => {
    const tinyBounds: Bounds = {
      north: 43.6501,
      south: 43.6500,
      east: -79.3800,
      west: -79.3801,
    };
    const mapSize: MapSize = { width: 400, height: 600 };
    const zoom = calculateZoom(tinyBounds, mapSize);

    // Should not exceed max zoom
    expect(zoom).toBeLessThanOrEqual(18);
    expect(zoom).toBeGreaterThanOrEqual(1);
  });
});
