
  mockly/
  ├── app/
  │   ├── auth/signin/page.tsx      # Sign in
  │   ├── auth/signup/page.tsx      # Sign up
  │   ├── dashboard/page.tsx        # User dashboard
  │   ├── dashboard/settings/       # Settings
  │   ├── dashboard/billing/        # Billing
  │   ├── scan/page.tsx             # Scan form
  │   ├── results/[scanId]/         # Results
  │   └── tutor/[issueId]/          # Interactive tutor
  ├── components/
  │   ├── auth/                     # Auth components
  │   ├── mocky/                    # Mocky character
  │   ├── scanner/                  # Scanner UI
  │   ├── tutor/                    # Tutor UI
  │   ├── providers/                # Context providers
  │   └── ui/                       # UI components
  ├── convex/
  │   ├── schema.ts                 # Database schema
  │   ├── auth.ts                   # Auth config
  │   ├── users.ts                  # User functions
  │   ├── projects.ts               # Project functions
  │   ├── scans.ts                  # Scan functions
  │   └── issues.ts                 # Issue functions
  ├── lib/
  │   ├── scanner/                  # Security scanner
  │   └── ai/                       # Gemini AI integration
  └── public/mocky/                 # SVG assets
