import { NextRequest, NextResponse } from "next/server";
import { generateFix } from "@/lib/ai/fix-generator";

export async function POST(request: NextRequest) {
  try {
    const { issueId, tableName, issueType, issueDescription } = await request.json();

    if (!tableName || !issueType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate fix using AI (or fallback)
    const fix = await generateFix({
      tableName,
      issueType,
      issueDescription: issueDescription || "",
    });

    return NextResponse.json(fix);
  } catch (error) {
    console.error("Error generating fix:", error);

    // Return fallback fix
    const { tableName } = await request.json().catch(() => ({ tableName: "table" }));

    const sql = `-- Enable Row Level Security
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

-- Create a policy that only allows users to access their own data
CREATE POLICY "Users can only access their own data"
ON ${tableName}
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);`;

    return NextResponse.json({
      explanation: `Let me help you secure the "${tableName}" table with proper Row Level Security.`,
      sql,
      agentPrompt: `# Fix Row Level Security on "${tableName}" Table

## Task
Secure the \`${tableName}\` table in my Supabase project by enabling Row Level Security (RLS).

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run This SQL

\`\`\`sql
${sql}
\`\`\`

### Step 3: Verify the Fix
Run this query to confirm RLS is enabled:

\`\`\`sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = '${tableName}';
\`\`\`

Expected result: \`rowsecurity\` should be \`true\`.

## Customization
- If your table uses a different column name (like \`owner_id\`), replace \`user_id\` with your column name.`,
    });
  }
}
