/**
 * Checkpoint Validators
 * Pure functions for validating checkpoint completion
 */

const EARTH_RADIUS_METERS = 6371000;

/**
 * Photo-only validation - always passes
 * Used when no location check is needed
 */
export function photoOnly(): boolean {
  return true;
}

/**
 * Manual validation - always passes
 * Accessibility fallback for manual completion
 */
export function manual(): boolean {
  return true;
}

/**
 * QR code validation
 * Compares scanned value with expected value (case-sensitive)
 */
export function qrCode(scanned: string, expected: string): boolean {
  return scanned === expected;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * GPS radius validation
 * Returns true if user is within specified radius of POI
 */
export function gpsRadius(
  userLat: number,
  userLng: number,
  poiLat: number,
  poiLng: number,
  radiusMeters: number
): boolean {
  const distance = haversineDistance(userLat, userLng, poiLat, poiLng);
  return distance <= radiusMeters;
}
