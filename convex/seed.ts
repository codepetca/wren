import { mutation } from "./_generated/server";

/**
 * Seed data: "Downtown Discovery" race
 * 6 POIs in a fictional downtown area (based on Toronto coordinates)
 */
const MOCK_RACE = {
  name: "Downtown Discovery",
  description: "Explore the heart of downtown! Find all 6 landmarks and snap a photo at each one.",
  bounds: {
    north: 43.6550,
    south: 43.6440,
    east: -79.3750,
    west: -79.3900,
  },
};

const MOCK_POIS = [
  {
    order: 1,
    lat: 43.6532,
    lng: -79.3832,
    clue: "Find the historic clock tower in the square. It's been telling time for over a century!",
    validationType: "PHOTO_ONLY" as const,
  },
  {
    order: 2,
    lat: 43.6505,
    lng: -79.3845,
    clue: "Look for the colorful mural on the side of the old brick building. What animals do you see?",
    validationType: "PHOTO_ONLY" as const,
  },
  {
    order: 3,
    lat: 43.6478,
    lng: -79.3810,
    clue: "The fountain in the park makes a perfect photo spot. Can you catch the water mid-splash?",
    validationType: "PHOTO_ONLY" as const,
  },
  {
    order: 4,
    lat: 43.6495,
    lng: -79.3875,
    clue: "This red phone booth is a piece of history. Strike a pose like you're making an important call!",
    validationType: "PHOTO_ONLY" as const,
  },
  {
    order: 5,
    lat: 43.6520,
    lng: -79.3790,
    clue: "The bronze statue in front of the library has a secret - can you find the hidden symbol on its base?",
    validationType: "PHOTO_ONLY" as const,
  },
  {
    order: 6,
    lat: 43.6455,
    lng: -79.3820,
    clue: "Your final stop! The arch at the entrance to the market marks the finish line. You made it!",
    validationType: "PHOTO_ONLY" as const,
  },
];

export const seedDemoRace = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if race already exists
    const existingRace = await ctx.db.query("races").first();
    if (existingRace) {
      return { raceId: existingRace._id, created: false, message: "Race already exists" };
    }

    // Create race
    const raceId = await ctx.db.insert("races", MOCK_RACE);

    // Create POIs
    for (const poi of MOCK_POIS) {
      await ctx.db.insert("pois", {
        raceId,
        ...poi,
      });
    }

    return { raceId, created: true, message: "Demo race created with 6 POIs" };
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all completions
    const completions = await ctx.db.query("completions").collect();
    for (const c of completions) {
      await ctx.db.delete(c._id);
    }

    // Delete all POIs
    const pois = await ctx.db.query("pois").collect();
    for (const p of pois) {
      await ctx.db.delete(p._id);
    }

    // Delete all races
    const races = await ctx.db.query("races").collect();
    for (const r of races) {
      await ctx.db.delete(r._id);
    }

    return {
      deleted: {
        completions: completions.length,
        pois: pois.length,
        races: races.length,
      },
    };
  },
});
