# Frontend Codemap

**Last Updated:** 2026-01-22
**Freshness:** Current

## Next.js App Router Structure

Using Next.js 14 App Router with TypeScript, Tailwind CSS, and Convex React integration.

## Route Hierarchy

```
/ (app/page.tsx)
├── Landing page with Mocky mascot
└── Public route

/auth
├── /signin (app/auth/signin/page.tsx)
│   └── Sign in form
└── /signup (app/auth/signup/page.tsx)
    └── Sign up form

/dashboard (app/dashboard/page.tsx)
├── Protected route
├── Recent scans list
├── Projects overview
├── /settings (app/dashboard/settings/page.tsx)
│   └── User profile settings
└── /billing (app/dashboard/billing/page.tsx)
    └── Subscription management

/scan (app/scan/page.tsx)
├── Protected route
├── Supabase URL + anon key form
└── Scan progress overlay

/results/[scanId] (app/results/[scanId]/page.tsx)
├── Protected route
├── Health score display
├── Issues list (grouped by severity)
└── Links to tutor

/tutor/[issueId] (app/tutor/[issueId]/page.tsx)
├── Protected route
├── AI-powered issue explanation
├── Code examples
└── Fix generator
```

## Middleware (`middleware.ts`)

Route protection via Convex Auth middleware:

```typescript
Protected: /dashboard/*, /scan/*, /results/*, /tutor/*
Auth Pages: /auth/signin, /auth/signup

Unauthenticated + Protected → Redirect to /auth/signin
Authenticated + Auth Pages → Redirect to /dashboard
```

## Component Organization

### `components/auth/`
- **AuthForm.tsx** - Reusable sign in/up form
- **RequireAuth.tsx** - Auth guard HOC
- **UserButton.tsx** - User menu dropdown

### `components/scanner/`
- **ScanForm.tsx** - URL + anon key input form
- **ScanProgress.tsx** - Animated scanning overlay
- **ScanResults.tsx** - Results display with severity badges

### `components/tutor/`
- **IssueExplainer.tsx** - AI-powered explanation UI
- **CodeBlock.tsx** - Syntax-highlighted code display
- **FixGenerator.tsx** - AI fix generation interface

### `components/mocky/`
- **MockyAvatar.tsx** - Mascot SVG with expressions
- **MockySpeechBubble.tsx** - Chat bubble for Mocky
- **MockyWithMessage.tsx** - Combined avatar + bubble

### `components/providers/`
- **ConvexClientProvider.tsx** - Convex React client wrapper

### `components/ui/`
Shared UI primitives (Radix-based):
- **Button.tsx** - Button with variants
- **Card.tsx** - Card container
- **Input.tsx** - Form input
- **Badge.tsx** - Status badges
- **DropdownMenu.tsx** - Menu component

## Layout (`app/layout.tsx`)

```tsx
ConvexAuthNextjsServerProvider (server-side auth)
  → <html>
    → ConvexClientProvider (client-side Convex)
      → Gradient background
        → {children}
```

**Metadata:** SEO-optimized title, description, OpenGraph tags

## Key Patterns

### 1. Real-time Data with Convex Hooks

```typescript
// Auto-updates when scan changes
const scan = useQuery(api.scans.getScan, { scanId })

// Mutations return optimistically
const updateScan = useMutation(api.scans.updateScan)
await updateScan({ scanId, status: "completed" })
```

### 2. Protected Pages

```typescript
export default function ProtectedPage() {
  return (
    <RequireAuth>
      <PageContent />
    </RequireAuth>
  )
}
```

### 3. API Route Integration

```typescript
// Hybrid approach: Convex for data, API routes for AI
const response = await fetch("/api/generate-fix", {
  method: "POST",
  body: JSON.stringify({ issueId })
})
```

### 4. Form Handling

```typescript
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async (data: FormData) => {
  setIsLoading(true)
  try {
    await mutation({ ...data })
    router.push("/success")
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false)
  }
}
```

## Styling System

### Tailwind Configuration (`tailwind.config.ts`)
- Custom color palette (blue-centric)
- Border radius variables
- Animation utilities (via tailwindcss-animate)

### Utility Function (`lib/utils/index.ts`)
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Usage: `cn("base-class", condition && "conditional-class", className)`

## State Management

**No global state library** - using:
1. **Convex Queries** - Server state (auto-synced)
2. **useState** - Local component state
3. **useRouter** - Navigation state
4. **URL Parameters** - Shareable state (scanId, issueId)

## Data Fetching Patterns

### Client Components ("use client")
```typescript
const data = useQuery(api.module.functionName, args)
const mutation = useMutation(api.module.functionName)

if (data === undefined) return <Loading />
if (data === null) return <NotFound />
return <Display data={data} />
```

### Server Components
Not heavily used (most pages are protected → require client-side auth)

## Animation

### Framer Motion
Used for:
- Scan progress animations
- Page transitions
- Mocky entrance animations
- Button hover states

Example:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

## Icons

**lucide-react** - Tree-shakeable icon library
- Imported individually: `import { IconName } from "lucide-react"`
- Used throughout UI (arrows, settings, alerts, etc.)

## Accessibility

- Radix UI primitives (keyboard nav, ARIA attributes)
- Focus management
- Semantic HTML
- Color contrast (blue-900 on light backgrounds)

## Performance Optimizations

1. **Code Splitting:** Automatic via App Router
2. **Dynamic Imports:** Not currently used (could optimize)
3. **Image Optimization:** Next.js Image (minimal usage)
4. **Font Optimization:** Inter via next/font/google

## Error Handling

**Pattern:**
```typescript
try {
  await riskyOperation()
} catch (error) {
  console.error("Operation failed:", error)
  // Show toast/alert (no toast system currently)
  // Fall back to safe state
}
```

**Improvement Opportunity:** Add global error boundary + toast system

## Type Safety

- Full TypeScript coverage
- Convex auto-generates types (`convex/_generated/api.d.ts`)
- No `any` types in component props
- Strict mode enabled

## Development Workflow

```bash
npm run dev              # Frontend (3000) + Convex dev server
npm run dev:frontend     # Frontend only
npm run dev:backend      # Convex only
npm run build            # Production build
npm run lint             # ESLint
```

## Browser Support

Next.js 14 targets modern browsers:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

No IE11 support.
