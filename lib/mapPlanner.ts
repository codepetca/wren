/**
 * Map Planner Engine
 * Pure functions for map calculations - no side effects
 */

import type { Coordinate, Bounds, MapSize } from "./types";

const MIN_ZOOM = 1;
const MAX_ZOOM = 18;

/**
 * Calculate bounding box from array of coordinates
 */
export function calculateBounds(coordinates: Coordinate[]): Bounds {
  if (coordinates.length === 0) {
    throw new Error("At least one coordinate required");
  }

  let north = -Infinity;
  let south = Infinity;
  let east = -Infinity;
  let west = Infinity;

  for (const coord of coordinates) {
    if (coord.lat > north) north = coord.lat;
    if (coord.lat < south) south = coord.lat;
    if (coord.lng > east) east = coord.lng;
    if (coord.lng < west) west = coord.lng;
  }

  return { north, south, east, west };
}

/**
 * Calculate center point of bounds
 */
export function calculateCenter(bounds: Bounds): Coordinate {
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };
}

/**
 * Calculate optimal zoom level for bounds to fit in map size
 * Based on Leaflet's fitBounds algorithm
 */
export function calculateZoom(bounds: Bounds, mapSize: MapSize): number {
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = MAX_ZOOM;

  function latRad(lat: number): number {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx: number, worldPx: number, fraction: number): number {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const latFraction = (latRad(bounds.north) - latRad(bounds.south)) / Math.PI;
  const lngDiff = bounds.east - bounds.west;
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

  const latZoom = zoom(mapSize.height, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapSize.width, WORLD_DIM.width, lngFraction);

  const calculatedZoom = Math.min(latZoom, lngZoom, ZOOM_MAX);

  // Clamp to valid range
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, calculatedZoom));
}
