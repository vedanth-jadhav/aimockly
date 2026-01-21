import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Get current user's profile
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

// Create or update profile
export const upsertProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        name: args.name,
        email: args.email,
        avatarUrl: args.avatarUrl,
        updatedAt: Date.now(),
      });
      return existingProfile._id;
    }

    return await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      plan: "free",
      projectsLimit: 1,
      stripeCustomerId: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get user's plan details
export const getUserPlan = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      return { plan: "free", projectsLimit: 1 };
    }

    return {
      plan: profile.plan,
      projectsLimit: profile.projectsLimit,
    };
  },
});

// Upgrade user plan
export const upgradePlan = mutation({
  args: {
    plan: v.union(v.literal("pro"), v.literal("team")),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const projectsLimit = args.plan === "pro" ? 1 : 5;

    await ctx.db.patch(profile._id, {
      plan: args.plan,
      projectsLimit,
      stripeCustomerId: args.stripeCustomerId || profile.stripeCustomerId,
      updatedAt: Date.now(),
    });
  },
});
