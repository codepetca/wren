import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  races: defineTable({
    name: v.string(),
    description: v.string(),
    bounds: v.object({
      north: v.number(),
      south: v.number(),
      east: v.number(),
      west: v.number(),
    }),
  }),

  pois: defineTable({
    raceId: v.id("races"),
    order: v.number(),
    lat: v.number(),
    lng: v.number(),
    clue: v.string(),
    validationType: v.union(
      v.literal("PHOTO_ONLY"),
      v.literal("GPS_RADIUS"),
      v.literal("QR_CODE"),
      v.literal("MANUAL")
    ),
    validationConfig: v.optional(
      v.object({
        radiusMeters: v.optional(v.number()),
        qrValue: v.optional(v.string()),
      })
    ),
  }).index("by_race", ["raceId"]),

  completions: defineTable({
    visitorId: v.string(),
    poiId: v.id("pois"),
    photoId: v.id("_storage"),
    completedAt: v.number(),
  })
    .index("by_visitor", ["visitorId"])
    .index("by_poi", ["poiId"]),
});
