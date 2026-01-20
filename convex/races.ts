import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("races") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getFirst = query({
  args: {},
  handler: async (ctx) => {
    // For MVP: just get the first race
    const races = await ctx.db.query("races").first();
    return races;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("races").collect();
  },
});
