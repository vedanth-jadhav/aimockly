import { NextRequest, NextResponse } from "next/server";

// In-memory storage for issues
const issuesStore = new Map<string, unknown>();

export async function GET(
  request: NextRequest,
  { params }: { params: { issueId: string } }
) {
  try {
    const { issueId } = params;

    // Try to get from store
    let issue = issuesStore.get(issueId) as Record<string, unknown> | undefined;

    if (!issue) {
      // Return mock data for demo
      issue = {
        _id: issueId,
        type: "public_table",
        severity: "critical" as const,
        tableName: "users",
        title: 'Table "users" is publicly accessible',
        description:
          "Hey! I noticed your users table is open to everyone. That means anyone with your API key can see all user data. Let me help you fix this!",
        technicalDetails:
          "Table accessible via REST API without additional authentication. RLS is not enabled.",
        suggestedFix: `-- Enable RLS on the table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy for authenticated users
CREATE POLICY "Users can only see their own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);`,
        isResolved: false,
      };
      issuesStore.set(issueId, issue);
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Error fetching issue:", error);
    return NextResponse.json(
      { error: "Failed to fetch issue" },
      { status: 500 }
    );
  }
}

export { issuesStore };
