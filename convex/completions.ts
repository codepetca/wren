import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByVisitor = query({
  args: { visitorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("completions")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .collect();
  },
});

export const create = mutation({
  args: {
    visitorId: v.string(),
    poiId: v.id("pois"),
    photoId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Check if already completed
    const existing = await ctx.db
      .query("completions")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .filter((q) => q.eq(q.field("poiId"), args.poiId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("completions", {
      visitorId: args.visitorId,
      poiId: args.poiId,
      photoId: args.photoId,
      completedAt: Date.now(),
    });
  },
});

export const clearByVisitor = mutation({
  args: { visitorId: v.string() },
  handler: async (ctx, args) => {
    const completions = await ctx.db
      .query("completions")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .collect();

    for (const completion of completions) {
      await ctx.db.delete(completion._id);
    }

    return completions.length;
  },
});
