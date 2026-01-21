import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // User profiles (extends auth users)
  profiles: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team")),
    projectsLimit: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  // Projects (Supabase projects being scanned)
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    supabaseUrl: v.string(),
    // Note: We don't store anon keys permanently for security
    lastScannedAt: v.optional(v.number()),
    totalScans: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_supabaseUrl", ["supabaseUrl"]),

  // Scans
  scans: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
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
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Security Issues
  issues: defineTable({
    scanId: v.id("scans"),
    projectId: v.id("projects"),
    userId: v.id("users"),
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
    aiGeneratedFix: v.optional(v.string()),
    aiAgentPrompt: v.optional(v.string()),
    isResolved: v.boolean(),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_scanId", ["scanId"])
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"])
    .index("by_severity", ["severity"]),

  // Payments
  payments: defineTable({
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    stripePaymentIntentId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    plan: v.union(v.literal("pro"), v.literal("team")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripePaymentIntentId", ["stripePaymentIntentId"]),
});
