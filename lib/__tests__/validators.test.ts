import { describe, it, expect } from "vitest";
import {
  photoOnly,
  gpsRadius,
  qrCode,
  manual,
  haversineDistance,
} from "../validators/index";

describe("photoOnly", () => {
  it("always returns true", () => {
    expect(photoOnly()).toBe(true);
  });
});

describe("manual", () => {
  it("always returns true", () => {
    expect(manual()).toBe(true);
  });
});

describe("qrCode", () => {
  it("returns true when scanned matches expected", () => {
    expect(qrCode("abc123", "abc123")).toBe(true);
  });

  it("returns false when scanned does not match expected", () => {
    expect(qrCode("abc123", "xyz789")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(qrCode("ABC123", "abc123")).toBe(false);
  });
});

describe("haversineDistance", () => {
  it("returns 0 for same point", () => {
    const distance = haversineDistance(43.65, -79.38, 43.65, -79.38);
    expect(distance).toBe(0);
  });

  it("calculates correct distance between Toronto and New York (~550km)", () => {
    // Toronto: 43.65, -79.38
    // New York: 40.71, -74.01
    const distance = haversineDistance(43.65, -79.38, 40.71, -74.01);
    // Should be approximately 550km
    expect(distance).toBeGreaterThan(540000);
    expect(distance).toBeLessThan(560000);
  });

  it("calculates short distances accurately", () => {
    // Two points ~100 meters apart
    const distance = haversineDistance(43.65, -79.38, 43.6509, -79.38);
    expect(distance).toBeGreaterThan(90);
    expect(distance).toBeLessThan(110);
  });
});

describe("gpsRadius", () => {
  it("returns true when user is within radius", () => {
    // User at exact POI location
    const result = gpsRadius(43.65, -79.38, 43.65, -79.38, 50);
    expect(result).toBe(true);
  });

  it("returns true when user is at edge of radius", () => {
    // User ~50 meters away, radius is 100 meters
    const result = gpsRadius(43.65, -79.38, 43.6504, -79.38, 100);
    expect(result).toBe(true);
  });

  it("returns false when user is outside radius", () => {
    // User ~100 meters away, radius is 50 meters
    const result = gpsRadius(43.65, -79.38, 43.6509, -79.38, 50);
    expect(result).toBe(false);
  });
});
