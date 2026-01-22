# Backend Codemap

**Last Updated:** 2026-01-22
**Freshness:** Current

## Convex Backend Structure

Convex provides serverless functions (queries/mutations) and real-time database with schema validation.

## Database Schema (`convex/schema.ts`)

### Tables

#### `profiles` (extends auth users)
- `userId` → id(users) - Link to auth system
- `email` - User email (indexed)
- `name?` - Display name
- `avatarUrl?` - Profile picture
- `stripeCustomerId?` - Stripe integration (indexed)
- `plan` - "free" | "pro" | "team"
- `projectsLimit` - Number of allowed projects
- `createdAt`, `updatedAt` - Timestamps

**Indexes:** by_userId, by_email, by_stripeCustomerId

#### `projects` (Supabase projects being scanned)
- `userId` → id(users) - Owner
- `name` - Project display name
- `supabaseUrl` - Target Supabase URL (indexed)
- `lastScannedAt?` - Most recent scan timestamp
- `totalScans` - Count of scans run
- `createdAt`, `updatedAt` - Timestamps

**Indexes:** by_userId, by_supabaseUrl

**Security Note:** Anon keys NOT stored (handled ephemerally)

#### `scans`
- `projectId` → id(projects)
- `userId` → id(users)
- `status` - "pending" | "scanning" | "completed" | "failed"
- `healthScore?` - 0-100 security score
- `issuesFound?` - Count of issues
- `tablesScanned?` - Count of tables analyzed
- `errorMessage?` - Failure details
- `startedAt`, `completedAt?` - Timestamps

**Indexes:** by_projectId, by_userId, by_status

#### `issues` (Security vulnerabilities)
- `scanId` → id(scans)
- `projectId` → id(projects)
- `userId` → id(users)
- `type` - Issue category (e.g., "rls_missing", "public_table")
- `severity` - "critical" | "warning" | "info"
- `tableName` - Affected table
- `title` - Short description
- `description` - User-friendly explanation
- `technicalDetails?` - Developer details
- `suggestedFix?` - SQL fix template
- `aiGeneratedFix?` - AI-generated SQL
- `aiAgentPrompt?` - Prompt for AI coding assistants
- `isResolved` - Resolution status
- `resolvedAt?` - Resolution timestamp
- `createdAt` - Creation timestamp

**Indexes:** by_scanId, by_projectId, by_userId, by_severity

#### `payments`
- `userId` → id(users)
- `projectId?` → id(projects)
- `stripePaymentIntentId` - Stripe integration (indexed)
- `stripeCustomerId?` - Stripe customer
- `amount` - Payment amount
- `currency` - Payment currency
- `status` - "pending" | "succeeded" | "failed" | "refunded"
- `plan` - "pro" | "team"
- `createdAt` - Timestamp

**Indexes:** by_userId, by_stripePaymentIntentId

#### Auth Tables (from @convex-dev/auth)
- `users`, `sessions`, `authAccounts` - Auto-generated

## Convex Functions

### `users.ts`
- `createProfile` (mutation) - Create user profile on first sign-in
- `getProfile` (query) - Get current user's profile
- `updateProfile` (mutation) - Update user profile
- `upgradePlan` (mutation) - Change subscription plan

### `projects.ts`
- `createProject` (mutation) - Create or get existing project by URL
- `getProjects` (query) - List user's projects
- `getProject` (query) - Get single project
- `deleteProject` (mutation) - Remove project + cascade delete scans/issues

### `scans.ts`
- `createScan` (mutation) - Initialize new scan
- `updateScan` (mutation) - Update scan status/results
- `getScan` (query) - Get single scan
- `getScanWithIssues` (query) - Get scan + associated issues
- `getProjectScans` (query) - List project's scan history
- `getRecentScans` (query) - Get recent scans with project info

### `issues.ts`
- `createIssues` (mutation) - Bulk insert issues from scan
- `getIssue` (query) - Get single issue
- `getIssuesByScans` (query) - Get issues for specific scans
- `updateIssue` (mutation) - Update issue (e.g., mark resolved)
- `saveAIFix` (mutation) - Store AI-generated fix

### `auth.ts` + `auth.config.ts`
- Convex Auth setup with email/password provider
- Session management
- Middleware integration

### `http.ts`
- HTTP routes for webhooks (e.g., Stripe)
- Public API endpoints if needed

## Authentication Flow

```
User → Sign In → Convex Auth → Create Session → getUserId() in functions
                                      ↓
                              Check userId === record.userId
                                      ↓
                              Return data OR throw error
```

**Key Pattern:** All queries/mutations use `auth.getUserId(ctx)` to enforce user isolation.

## Real-time Subscriptions

Convex provides automatic real-time updates:
```typescript
// Component automatically re-renders when scan updates
const scan = useQuery(api.scans.getScan, { scanId })
```

## Data Access Patterns

### User Isolation
All functions verify ownership:
```typescript
const userId = await auth.getUserId(ctx)
if (!userId) throw new Error("Not authenticated")

const record = await ctx.db.get(recordId)
if (record.userId !== userId) throw new Error("Not found")
```

### Indexed Queries
Leverage indexes for performance:
```typescript
// Efficient: Uses by_userId index
ctx.db.query("scans")
  .withIndex("by_userId", q => q.eq("userId", userId))

// Efficient: Uses by_scanId index
ctx.db.query("issues")
  .withIndex("by_scanId", q => q.eq("scanId", scanId))
```

### Cascade Deletes
Projects implement manual cascade:
```typescript
// Delete project → delete scans → delete issues
for (const scan of scans) {
  const issues = await getIssuesByScan(scan._id)
  for (const issue of issues) {
    await ctx.db.delete(issue._id)
  }
  await ctx.db.delete(scan._id)
}
```

## API Routes (Next.js)

### `/api/scan` (POST)
- Accepts: `{ url, anonKey, scanId, projectId }`
- Runs: `lib/scanner/rls-analyzer.ts`
- Returns: `{ healthScore, tablesScanned, issues[] }`

### `/api/generate-fix` (POST)
- Accepts: `{ issueId }` or raw issue data
- Runs: `lib/ai/fix-generator.ts`
- Returns: `{ explanation, sql, agentPrompt }`

### `/api/scan/[scanId]` (GET)
- Public endpoint to view scan results
- Requires authentication via Convex

### `/api/issue/[issueId]` (GET)
- Get issue details
- Requires authentication

## Environment Variables

**Required:**
- `CONVEX_DEPLOYMENT` - Auto-set by Convex CLI
- `NEXT_PUBLIC_CONVEX_URL` - Public Convex endpoint
- `GOOGLE_AI_API_KEY` - Gemini API key
- `STRIPE_SECRET_KEY` - Stripe integration
- `STRIPE_WEBHOOK_SECRET` - Webhook verification

## Deployment

```bash
npm run build  # Runs: convex deploy --cmd 'next build'
```

1. Convex schema pushed to cloud
2. Convex functions deployed
3. Next.js build runs with Convex URL
4. Deploy to Vercel with env vars
