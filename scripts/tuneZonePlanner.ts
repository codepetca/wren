#!/usr/bin/env npx tsx
/**
 * Zone Planner Tuning Script
 *
 * Run: npx tsx scripts/tuneZonePlanner.ts
 *
 * Use this to visualize how POIs get clustered into zones
 * and tune the configuration for your needs.
 */

import { planZones, getZonePOIs, type ZoneConfig, type TransportMode } from "../lib/engines/zonePlanner";

// ============================================================================
// Sample POI Sets - Test different scenarios
// ============================================================================

const poiSets: Record<string, Array<{ name: string; lat: number; lng: number }>> = {
  // Toronto downtown - original test set
  toronto: [
    { name: "CN Tower", lat: 43.6426, lng: -79.3871 },
    { name: "Union Station", lat: 43.6453, lng: -79.3806 },
    { name: "St Lawrence Market", lat: 43.6487, lng: -79.3715 },
    { name: "Distillery District", lat: 43.6503, lng: -79.3596 },
    { name: "Eaton Centre", lat: 43.6544, lng: -79.3807 },
    { name: "Nathan Phillips Square", lat: 43.6525, lng: -79.3832 },
    { name: "Kensington Market", lat: 43.6547, lng: -79.4006 },
    { name: "AGO", lat: 43.6536, lng: -79.3925 },
    { name: "ROM", lat: 43.6677, lng: -79.3948 },
    { name: "Casa Loma", lat: 43.6780, lng: -79.4094 },
    { name: "North York Centre", lat: 43.7615, lng: -79.4111 },
    { name: "Mel Lastman Square", lat: 43.7673, lng: -79.4139 },
  ],

  // Linear chain - POIs along a street (tests chain-breaking)
  linear: [
    { name: "Point A", lat: 43.6500, lng: -79.4000 },
    { name: "Point B", lat: 43.6550, lng: -79.3950 }, // ~700m from A
    { name: "Point C", lat: 43.6600, lng: -79.3900 }, // ~700m from B
    { name: "Point D", lat: 43.6650, lng: -79.3850 }, // ~700m from C
    { name: "Point E", lat: 43.6700, lng: -79.3800 }, // ~700m from D
    { name: "Point F", lat: 43.6750, lng: -79.3750 }, // ~700m from E
    // Total chain: ~3.5km end-to-end
  ],

  // Two distinct clusters with gap
  twoClusters: [
    // Cluster 1: Downtown
    { name: "Downtown 1", lat: 43.6500, lng: -79.3800 },
    { name: "Downtown 2", lat: 43.6510, lng: -79.3810 },
    { name: "Downtown 3", lat: 43.6490, lng: -79.3790 },
    { name: "Downtown 4", lat: 43.6505, lng: -79.3795 },
    // Cluster 2: Midtown (~3km away)
    { name: "Midtown 1", lat: 43.6800, lng: -79.3900 },
    { name: "Midtown 2", lat: 43.6810, lng: -79.3910 },
    { name: "Midtown 3", lat: 43.6790, lng: -79.3890 },
    { name: "Midtown 4", lat: 43.6805, lng: -79.3895 },
  ],

  // Tight cluster - all within 200m (should be 1 zone)
  tight: [
    { name: "Spot 1", lat: 43.6500, lng: -79.3800 },
    { name: "Spot 2", lat: 43.6502, lng: -79.3802 },
    { name: "Spot 3", lat: 43.6498, lng: -79.3798 },
    { name: "Spot 4", lat: 43.6501, lng: -79.3801 },
    { name: "Spot 5", lat: 43.6499, lng: -79.3799 },
    { name: "Spot 6", lat: 43.6503, lng: -79.3797 },
  ],

  // Vertical spread - tests portrait mode (N-S spread, tight E-W)
  vertical: [
    { name: "North 1", lat: 43.6800, lng: -79.3850 },
    { name: "North 2", lat: 43.6790, lng: -79.3860 },
    { name: "Mid 1", lat: 43.6600, lng: -79.3855 },
    { name: "Mid 2", lat: 43.6590, lng: -79.3845 },
    { name: "South 1", lat: 43.6400, lng: -79.3850 },
    { name: "South 2", lat: 43.6410, lng: -79.3840 },
  ],

  // Scattered - random distribution across city
  scattered: [
    { name: "NW Corner", lat: 43.7000, lng: -79.4500 },
    { name: "NE Corner", lat: 43.7000, lng: -79.3500 },
    { name: "Center", lat: 43.6600, lng: -79.4000 },
    { name: "SW Corner", lat: 43.6200, lng: -79.4500 },
    { name: "SE Corner", lat: 43.6200, lng: -79.3500 },
  ],
};

// Default to toronto for backward compatibility
const samplePOIs = poiSets.toronto;

// ============================================================================
// Configuration Presets
// ============================================================================

const WALKING_SPEED_KMH = 5; // Average walking speed

function walkingTimeToMeters(minutes: number): number {
  return (minutes / 60) * WALKING_SPEED_KMH * 1000;
}

const presets: Record<string, ZoneConfig> = {
  // Walking mode - 20 min at 5 km/h = 1.67km
  walk: {
    transportMode: "walk",
    minPoisPerZone: 3,
    maxPoisPerZone: 10,
  },

  // Biking mode - 20 min at 15 km/h = 5km
  bike: {
    transportMode: "bike",
    minPoisPerZone: 4,
    maxPoisPerZone: 12,
  },

  // Driving mode - 20 min at 40 km/h = 13.3km
  car: {
    transportMode: "car",
    minPoisPerZone: 5,
    maxPoisPerZone: 15,
  },

  // Legacy presets for manual tuning
  tight: {
    clusterRadiusMeters: walkingTimeToMeters(10),
    maxZoneDiameterMeters: walkingTimeToMeters(10),
    minPoisPerZone: 3,
    maxPoisPerZone: 6,
  },

  relaxed: {
    clusterRadiusMeters: walkingTimeToMeters(20),
    maxZoneDiameterMeters: walkingTimeToMeters(20),
    minPoisPerZone: 3,
    maxPoisPerZone: 10,
  },
};

// ============================================================================
// Haversine distance (for reporting)
// ============================================================================

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function metersToWalkingTime(meters: number): number {
  return (meters / 1000 / WALKING_SPEED_KMH) * 60;
}

// ============================================================================
// Analysis
// ============================================================================

/** Speed in km/h for each transport mode */
const TRANSPORT_SPEEDS: Record<TransportMode, number> = {
  walk: 5,
  bike: 15,
  car: 40,
};

function analyzeZones(pois: Array<{ name: string; lat: number; lng: number }>, config: ZoneConfig) {
  const zones = planZones(pois, config);

  // Calculate effective diameter based on transport mode or explicit config
  const mode = config.transportMode || "walk";
  const speed = TRANSPORT_SPEEDS[mode];
  const autodiameter = Math.round((20 / 60) * speed * 1000); // 20 min default
  const diameter = config.maxZoneDiameterMeters || autodiameter;
  const travelTime = (diameter / 1000 / speed) * 60;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Config:`);
  console.log(`  transportMode: ${mode} (${speed} km/h)`);
  console.log(`  maxDiameter:   ${diameter}m (~${travelTime.toFixed(0)} min by ${mode})`);
  console.log(`  minPOIs: ${config.minPoisPerZone || 3}, maxPOIs: ${config.maxPoisPerZone || 10}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Total zones: ${zones.length}`);

  zones.forEach((zone, i) => {
    const zonePois = getZonePOIs(pois, zone);

    // Calculate max distance between any two POIs in zone
    let maxDistance = 0;
    for (let a = 0; a < zonePois.length; a++) {
      for (let b = a + 1; b < zonePois.length; b++) {
        const d = haversineDistance(zonePois[a].lat, zonePois[a].lng, zonePois[b].lat, zonePois[b].lng);
        if (d > maxDistance) maxDistance = d;
      }
    }

    // Calculate bounds dimensions
    const nsSpan = haversineDistance(zone.bounds.north, zone.center.lng, zone.bounds.south, zone.center.lng);
    const ewSpan = haversineDistance(zone.center.lat, zone.bounds.west, zone.center.lat, zone.bounds.east);

    console.log(`\nZone ${i}: ${zonePois.length} POIs, zoom ${zone.zoom}`);
    const travelTimeForDist = (meters: number) => (meters / 1000 / speed) * 60;

    console.log(`  Bounds: ${nsSpan.toFixed(0)}m N-S × ${ewSpan.toFixed(0)}m E-W`);
    console.log(`  Max travel between POIs: ${maxDistance.toFixed(0)}m (~${travelTimeForDist(maxDistance).toFixed(0)} min by ${mode})`);
    console.log(`  POIs:`);
    zonePois.forEach((poi) => {
      console.log(`    - ${poi.name}`);
    });
  });
}

// ============================================================================
// Run
// ============================================================================

const args = process.argv.slice(2);
const presetArg = args.find(a => !a.startsWith("--")) || "relaxed";
const poiSetArg = args.find(a => a.startsWith("--pois="))?.split("=")[1] || "toronto";
const testAllPois = args.includes("--all-pois");

const selectedPois = poiSets[poiSetArg] || poiSets.toronto;

console.log("Zone Planner Tuning");
console.log("==================");
console.log(`Walking speed assumption: ${WALKING_SPEED_KMH} km/h\n`);

if (testAllPois) {
  // Test all POI sets with a single preset
  const config = presets[presetArg] || presets.relaxed;
  console.log(`Testing all POI sets with "${presetArg}" preset\n`);

  for (const [setName, pois] of Object.entries(poiSets)) {
    console.log(`\n${"#".repeat(60)}`);
    console.log(`POI SET: ${setName.toUpperCase()} (${pois.length} POIs)`);
    console.log(`${"#".repeat(60)}`);
    analyzeZones(pois, config);
  }
} else if (presetArg === "all") {
  // Test all presets with selected POI set
  console.log(`POI Set: ${poiSetArg} (${selectedPois.length} POIs)\n`);

  for (const [name, config] of Object.entries(presets)) {
    console.log(`\n\n>>> PRESET: ${name.toUpperCase()}`);
    analyzeZones(selectedPois, config);
  }
} else if (presets[presetArg]) {
  // Single preset, single POI set
  console.log(`POI Set: ${poiSetArg} (${selectedPois.length} POIs)\n`);
  analyzeZones(selectedPois, presets[presetArg]);
} else {
  console.log(`Unknown preset: ${presetArg}`);
  console.log(`Available presets: ${Object.keys(presets).join(", ")}, all`);
  console.log(`Available POI sets: ${Object.keys(poiSets).join(", ")}`);
}

console.log("\n" + "=".repeat(60));
console.log("Usage:");
console.log("  npx tsx scripts/tuneZonePlanner.ts [preset] [--pois=setName]");
console.log("  npx tsx scripts/tuneZonePlanner.ts [preset] --all-pois");
console.log(`\nPresets: ${Object.keys(presets).join(", ")}, all`);
console.log(`POI sets: ${Object.keys(poiSets).join(", ")}`);
