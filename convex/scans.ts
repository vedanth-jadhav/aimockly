import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Create a new scan
export const createScan = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify project ownership
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found");
    }

    const scanId = await ctx.db.insert("scans", {
      projectId: args.projectId,
      userId,
      status: "pending",
      startedAt: Date.now(),
    });

    // Update project's last scanned time and total scans
    await ctx.db.patch(args.projectId, {
      lastScannedAt: Date.now(),
      totalScans: project.totalScans + 1,
      updatedAt: Date.now(),
    });

    return scanId;
  },
});

// Update scan status
export const updateScan = mutation({
  args: {
    scanId: v.id("scans"),
    status: v.union(
      v.literal("pending"),
      v.literal("scanning"),
      v.literal("completed"),
      v.literal("failed")
    ),
    healthScore: v.optional(v.number()),
    issuesFound: v.optional(v.number()),
    tablesScanned: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const scan = await ctx.db.get(args.scanId);
    if (!scan || scan.userId !== userId) {
      throw new Error("Scan not found");
    }

    const updates: Record<string, unknown> = {
      status: args.status,
    };

    if (args.healthScore !== undefined) updates.healthScore = args.healthScore;
    if (args.issuesFound !== undefined) updates.issuesFound = args.issuesFound;
    if (args.tablesScanned !== undefined) updates.tablesScanned = args.tablesScanned;
    if (args.errorMessage !== undefined) updates.errorMessage = args.errorMessage;

    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.scanId, updates);
  },
});

// Get a specific scan
export const getScan = query({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const scan = await ctx.db.get(args.scanId);
    if (!scan || scan.userId !== userId) return null;

    return scan;
  },
});

// Get scan with issues
export const getScanWithIssues = query({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const scan = await ctx.db.get(args.scanId);
    if (!scan || scan.userId !== userId) return null;

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_scanId", (q) => q.eq("scanId", args.scanId))
      .collect();

    return { ...scan, issues };
  },
});

// Get all scans for a project
export const getProjectScans = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return [];

    return await ctx.db
      .query("scans")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

// Get recent scans for user
export const getRecentScans = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const scans = await ctx.db
      .query("scans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 10);

    // Get project info for each scan
    const scansWithProjects = await Promise.all(
      scans.map(async (scan) => {
        const project = await ctx.db.get(scan.projectId);
        return { ...scan, project };
      })
    );

    return scansWithProjects;
  },
});
