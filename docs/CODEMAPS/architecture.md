# Architecture Codemap

**Last Updated:** 2026-01-22
**Freshness:** Current

## Overview

Mockly is a full-stack security scanner and interactive tutor for Supabase applications. Built with Next.js 14 App Router, Convex serverless backend, and Google Gemini AI.

## Tech Stack

### Frontend
- **Framework:** Next.js 14.1.3 (App Router)
- **Styling:** Tailwind CSS 3.4.1 + tailwindcss-animate
- **UI Components:** Radix UI primitives + custom components
- **Animation:** Framer Motion 11.0.8
- **Icons:** lucide-react 0.344.0
- **State:** Convex React hooks (real-time)

### Backend
- **Runtime:** Convex 1.17.0 (serverless functions + real-time database)
- **Auth:** @convex-dev/auth 0.0.71 (NextAuth-compatible)
- **Payments:** Stripe 14.21.0
- **HTTP:** Convex HTTP routes + Next.js API routes

### AI/ML
- **Model:** Google Gemini 3.0 Flash (@google/generative-ai 0.21.0)
- **Use Cases:** Security tutoring, fix generation, agent prompts

## Architecture Patterns

### 1. Hybrid Routing
```
Next.js App Router (pages) → Convex (queries/mutations) ← Real-time subscriptions
                    ↓
              API Routes (AI operations)
```

### 2. Data Flow
```
User Input → ScanForm → API Route → Scanner Lib → Convex Mutations → Database
                                                          ↓
                                                    Real-time Updates
                                                          ↓
                                                    React Components
```

### 3. Security Model
- Middleware-based route protection (`middleware.ts`)
- Convex auth integration with user ownership checks
- No sensitive credentials stored (anon keys handled ephemerally)

## Key Directories

```
app/                    # Next.js App Router pages
├── api/               # API routes (AI, scan endpoints)
├── auth/              # Sign in/up pages
├── dashboard/         # Protected dashboard pages
├── results/[scanId]/  # Scan results detail
├── scan/              # Scan submission page
└── tutor/[issueId]/   # Interactive tutor

convex/                # Backend (serverless functions + schema)
├── schema.ts          # Database schema definition
├── auth.ts/.config.ts # Authentication setup
├── users.ts           # User profile operations
├── projects.ts        # Project CRUD
├── scans.ts           # Scan lifecycle
├── issues.ts          # Security issue management
└── http.ts            # HTTP endpoints

components/            # React components (domain-organized)
├── auth/              # Auth UI (forms, buttons, guards)
├── scanner/           # Scan form, progress, results
├── tutor/             # Issue explainer, code blocks, fix generator
├── mocky/             # Mascot components
├── providers/         # Context providers
└── ui/                # Shared UI primitives

lib/                   # Business logic libraries
├── scanner/           # RLS analyzer + Supabase client
├── ai/                # AI fix generation
└── utils/             # Utilities (cn, etc.)
```

## Core Workflows

### 1. Scan Workflow
1. User submits Supabase URL + anon key (`/scan`)
2. Create project + scan record (Convex)
3. Run security scan via API route (`/api/scan`)
4. Scanner analyzes RLS policies and table accessibility
5. Store issues in Convex database
6. Redirect to results page (`/results/[scanId]`)

### 2. Tutor Workflow
1. User clicks "Learn More" on issue
2. Navigate to `/tutor/[issueId]`
3. AI generates friendly explanation
4. User can request SQL fix
5. AI generates fix + agent prompt

### 3. Auth Workflow
1. Middleware checks route protection
2. Unauthenticated → `/auth/signin`
3. Convex Auth handles credentials
4. Create user profile on first sign-in
5. Redirect to `/dashboard`

## External Dependencies

- **Convex:** Real-time database + serverless functions
- **Google AI:** Gemini API for tutoring/fix generation
- **Stripe:** Payment processing (pro/team plans)
- **Supabase:** Target of security scans (not a dependency)

## Deployment Strategy

- **Frontend:** Vercel (Next.js optimized)
- **Backend:** Convex Cloud (auto-deployed)
- **Build Command:** `npm run build` (deploys Convex + builds Next.js)
- **Environment:** Requires `GOOGLE_AI_API_KEY`, Convex env vars

## Performance Characteristics

- **Real-time:** Convex subscriptions for live scan updates
- **Optimistic UI:** Mutations return immediately
- **Code Splitting:** Next.js automatic route-based splitting
- **Image Optimization:** Next.js Image component (not heavily used)

## Security Features

1. **Route Protection:** Middleware guards protected routes
2. **User Isolation:** All queries filtered by `userId`
3. **No Secret Storage:** Anon keys never persisted
4. **Stripe Webhooks:** Secure payment verification
5. **AI Safety:** Structured outputs, no user code execution
