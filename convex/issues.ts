import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Create an issue
export const createIssue = mutation({
  args: {
    scanId: v.id("scans"),
    projectId: v.id("projects"),
    type: v.string(),
    severity: v.union(
      v.literal("critical"),
      v.literal("warning"),
      v.literal("info")
    ),
    tableName: v.string(),
    title: v.string(),
    description: v.string(),
    technicalDetails: v.optional(v.string()),
    suggestedFix: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("issues", {
      scanId: args.scanId,
      projectId: args.projectId,
      userId,
      type: args.type,
      severity: args.severity,
      tableName: args.tableName,
      title: args.title,
      description: args.description,
      technicalDetails: args.technicalDetails,
      suggestedFix: args.suggestedFix,
      isResolved: false,
      createdAt: Date.now(),
    });
  },
});

// Create multiple issues at once
export const createIssues = mutation({
  args: {
    scanId: v.id("scans"),
    projectId: v.id("projects"),
    issues: v.array(
      v.object({
        type: v.string(),
        severity: v.union(
          v.literal("critical"),
          v.literal("warning"),
          v.literal("info")
        ),
        tableName: v.string(),
        title: v.string(),
        description: v.string(),
        technicalDetails: v.optional(v.string()),
        suggestedFix: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const issueIds = await Promise.all(
      args.issues.map((issue) =>
        ctx.db.insert("issues", {
          scanId: args.scanId,
          projectId: args.projectId,
          userId,
          type: issue.type,
          severity: issue.severity,
          tableName: issue.tableName,
          title: issue.title,
          description: issue.description,
          technicalDetails: issue.technicalDetails,
          suggestedFix: issue.suggestedFix,
          isResolved: false,
          createdAt: Date.now(),
        })
      )
    );

    return issueIds;
  },
});

// Get issue by ID
export const getIssue = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.userId !== userId) return null;

    return issue;
  },
});

// Get issues by scan
export const getIssuesByScan = query({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const scan = await ctx.db.get(args.scanId);
    if (!scan || scan.userId !== userId) return [];

    return await ctx.db
      .query("issues")
      .withIndex("by_scanId", (q) => q.eq("scanId", args.scanId))
      .collect();
  },
});

// Update issue with AI-generated fix
export const updateIssueWithFix = mutation({
  args: {
    issueId: v.id("issues"),
    aiGeneratedFix: v.string(),
    aiAgentPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.userId !== userId) {
      throw new Error("Issue not found");
    }

    await ctx.db.patch(args.issueId, {
      aiGeneratedFix: args.aiGeneratedFix,
      aiAgentPrompt: args.aiAgentPrompt,
    });
  },
});

// Mark issue as resolved
export const resolveIssue = mutation({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.userId !== userId) {
      throw new Error("Issue not found");
    }

    await ctx.db.patch(args.issueId, {
      isResolved: true,
      resolvedAt: Date.now(),
    });
  },
});

// Mark issue as unresolved
export const unresolveIssue = mutation({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.userId !== userId) {
      throw new Error("Issue not found");
    }

    await ctx.db.patch(args.issueId, {
      isResolved: false,
      resolvedAt: undefined,
    });
  },
});

// Get issue stats for user
export const getIssueStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const total = issues.length;
    const resolved = issues.filter((i) => i.isResolved).length;
    const critical = issues.filter((i) => i.severity === "critical" && !i.isResolved).length;
    const warning = issues.filter((i) => i.severity === "warning" && !i.isResolved).length;
    const info = issues.filter((i) => i.severity === "info" && !i.isResolved).length;

    return { total, resolved, critical, warning, info };
  },
});
