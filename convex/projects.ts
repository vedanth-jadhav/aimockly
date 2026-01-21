import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Create a new project
export const createProject = mutation({
  args: {
    name: v.string(),
    supabaseUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check project limit
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const existingProjects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const limit = profile?.projectsLimit || 1;
    if (existingProjects.length >= limit) {
      throw new Error(`Project limit reached. Upgrade to add more projects.`);
    }

    // Check if project already exists
    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_supabaseUrl", (q) => q.eq("supabaseUrl", args.supabaseUrl))
      .first();

    if (existingProject && existingProject.userId === userId) {
      return existingProject._id;
    }

    return await ctx.db.insert("projects", {
      userId,
      name: args.name,
      supabaseUrl: args.supabaseUrl,
      totalScans: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get all projects for current user
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get a specific project
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return null;

    return project;
  },
});

// Update project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found");
    }

    await ctx.db.patch(args.projectId, {
      name: args.name || project.name,
      updatedAt: Date.now(),
    });
  },
});

// Delete project
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found");
    }

    // Delete all related scans and issues
    const scans = await ctx.db
      .query("scans")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const scan of scans) {
      const issues = await ctx.db
        .query("issues")
        .withIndex("by_scanId", (q) => q.eq("scanId", scan._id))
        .collect();

      for (const issue of issues) {
        await ctx.db.delete(issue._id);
      }
      await ctx.db.delete(scan._id);
    }

    await ctx.db.delete(args.projectId);
  },
});
