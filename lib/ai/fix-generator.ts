import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export interface FixGenerationRequest {
  tableName: string;
  issueType: string;
  issueDescription: string;
  columns?: string[];
  currentPolicy?: string;
}

export interface GeneratedFix {
  explanation: string;
  sql: string;
  agentPrompt: string;
}

const SYSTEM_PROMPT = `You are a Supabase security expert. Generate a fix for the given database security issue.

OUTPUT FORMAT (valid JSON only):
{
  "explanation": "1-2 friendly sentences explaining the fix in simple terms",
  "sql": "Complete, copy-paste ready SQL with comments",
  "agentPrompt": "A detailed prompt for an AI coding assistant to implement this fix"
}

RULES FOR SQL:
- Always enable RLS first with ALTER TABLE
- Create specific, least-privilege policies
- Add helpful inline comments
- Use auth.uid() for user-owned data patterns
- Include example alternatives as comments if applicable

RULES FOR agentPrompt:
Write a comprehensive, actionable prompt that a developer can copy-paste directly into an AI coding assistant (like Claude Code, Cursor, Windsurf, or GitHub Copilot). The prompt should:

1. Start with a clear task statement
2. Provide context about the security issue
3. Include the exact SQL code to run
4. Specify step-by-step instructions for Supabase Dashboard
5. Include verification steps to confirm the fix worked
6. Mention edge cases or customizations needed (e.g., if column names differ)
7. Be formatted with markdown for readability

Make the prompt self-contained so the AI assistant has everything needed without additional context.`;

export async function generateFix(request: FixGenerationRequest): Promise<GeneratedFix> {
  const userPrompt = buildUserPrompt(request);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userPrompt },
    ]);

    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    return {
      explanation: parsed.explanation || "Here's how to fix this issue:",
      sql: parsed.sql || "",
      agentPrompt: parsed.agentPrompt || generateFallbackAgentPrompt(request),
    };
  } catch (error) {
    console.error("AI fix generation error:", error);
    return generateFallbackFix(request);
  }
}

function buildUserPrompt(request: FixGenerationRequest): string {
  let prompt = `Generate a security fix for this Supabase issue:

TABLE: ${request.tableName}
ISSUE TYPE: ${request.issueType}
DESCRIPTION: ${request.issueDescription}`;

  if (request.columns && request.columns.length > 0) {
    prompt += `\nCOLUMNS: ${request.columns.join(", ")}`;
  }

  if (request.currentPolicy) {
    prompt += `\nCURRENT POLICY: ${request.currentPolicy}`;
  }

  prompt += `

Generate the fix with:
1. SQL that enables RLS and creates appropriate policies
2. Assume a user_id column exists for user-owned data (mention how to adapt if different)
3. A comprehensive agent prompt for AI coding assistants

Return valid JSON.`;

  return prompt;
}

function generateFallbackAgentPrompt(request: FixGenerationRequest): string {
  const sql = `ALTER TABLE ${request.tableName} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data"
ON ${request.tableName}
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);`;

  return `# Fix Row Level Security on "${request.tableName}" Table

## Task
Secure the \`${request.tableName}\` table in my Supabase project by enabling Row Level Security (RLS) and adding appropriate policies.

## The Problem
${request.issueDescription || `The \`${request.tableName}\` table is currently accessible to anyone with the anon key, which is a security vulnerability.`}

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
WHERE schemaname = 'public' AND tablename = '${request.tableName}';
\`\`\`

Expected result: \`rowsecurity\` should be \`true\`.

### Step 4: Test the Policy
1. Sign in as a test user in your app
2. Try to fetch data from \`${request.tableName}\`
3. Confirm you only see rows where \`user_id\` matches your authenticated user

## Customization Notes

- **Different column name?** If your table uses something other than \`user_id\` (like \`owner_id\`, \`created_by\`, or \`author_id\`), replace \`user_id\` in the policy with your column name.

- **Public read access?** If you want anyone to read but only owners to modify:
\`\`\`sql
CREATE POLICY "Public read access" ON ${request.tableName} FOR SELECT USING (true);
CREATE POLICY "Owner modify access" ON ${request.tableName} FOR INSERT, UPDATE, DELETE TO authenticated USING (auth.uid() = user_id);
\`\`\`

- **Admin override?** Add this for admin access:
\`\`\`sql
CREATE POLICY "Admin full access" ON ${request.tableName} TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
\`\`\`

## Success Criteria
- [ ] RLS is enabled on \`${request.tableName}\`
- [ ] Policy restricts access to authenticated users
- [ ] Users can only see/modify their own rows
- [ ] App functionality still works correctly`;
}

function generateFallbackFix(request: FixGenerationRequest): GeneratedFix {
  const tableName = request.tableName;

  const sql = `-- Step 1: Enable Row Level Security
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policy for authenticated users
-- Users can only access rows where user_id matches their auth.uid()
CREATE POLICY "Users can only access their own data"
ON ${tableName}
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ALTERNATIVE POLICIES (uncomment if needed):

-- Public read, private write:
-- CREATE POLICY "Anyone can read" ON ${tableName} FOR SELECT USING (true);
-- CREATE POLICY "Owners can modify" ON ${tableName} FOR INSERT, UPDATE, DELETE TO authenticated USING (auth.uid() = user_id);

-- Admin bypass:
-- CREATE POLICY "Admin access" ON ${tableName} TO authenticated USING (auth.jwt() ->> 'role' = 'admin');`;

  const agentPrompt = generateFallbackAgentPrompt({ ...request, issueDescription: request.issueDescription || `The "${tableName}" table is publicly accessible without RLS protection.` });

  return {
    explanation: `I'll help you protect the "${tableName}" table by enabling Row Level Security and adding a policy that ensures users can only access their own data.`,
    sql,
    agentPrompt,
  };
}
