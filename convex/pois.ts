import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("pois") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByRace = query({
  args: { raceId: v.id("races") },
  handler: async (ctx, args) => {
    const pois = await ctx.db
      .query("pois")
      .withIndex("by_race", (q) => q.eq("raceId", args.raceId))
      .collect();
    // Sort by order
    return pois.sort((a, b) => a.order - b.order);
  },
});
