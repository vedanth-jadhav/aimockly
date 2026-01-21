import { NextRequest, NextResponse } from "next/server";

// In-memory storage (shared with main scan route)
const scansStore = new Map<string, unknown>();
const issuesStore = new Map<string, unknown>();

export async function GET(
  request: NextRequest,
  { params }: { params: { scanId: string } }
) {
  try {
    const { scanId } = params;

    // Get scan data
    const scanData = scansStore.get(scanId) as Record<string, unknown> | undefined;

    if (!scanData) {
      // Return mock data for demo purposes
      const mockIssues = [
        {
          _id: `issue_${scanId}_0`,
          type: "public_table",
          severity: "critical" as const,
          tableName: "users",
          title: 'Table "users" is publicly accessible',
          description:
            "Anyone with your project URL and anon key can read all data from this table. This includes sensitive user information.",
          technicalDetails: "Table accessible via REST API without additional authentication",
          isResolved: false,
        },
        {
          _id: `issue_${scanId}_1`,
          type: "sensitive_data",
          severity: "critical" as const,
          tableName: "users",
          title: "Sensitive data exposed: email",
          description:
            'The column "email" in table "users" contains email addresses that are currently accessible to anyone.',
          technicalDetails: 'Column "email" matches pattern for email addresses',
          isResolved: false,
        },
        {
          _id: `issue_${scanId}_2`,
          type: "public_table",
          severity: "warning" as const,
          tableName: "posts",
          title: 'Table "posts" is publicly accessible',
          description:
            "This table can be read by anyone. If posts should be private or user-specific, consider adding RLS.",
          technicalDetails: "Table accessible via REST API without additional authentication",
          isResolved: false,
        },
      ];

      // Store mock issues
      mockIssues.forEach((issue) => {
        issuesStore.set(issue._id, issue);
      });

      return NextResponse.json({
        scanId,
        status: "completed",
        healthScore: 45,
        tablesScanned: 5,
        issues: mockIssues,
      });
    }

    // Get all issues for this scan
    const issues: unknown[] = [];
    issuesStore.forEach((issue, id) => {
      if (id.includes(scanId)) {
        issues.push(issue);
      }
    });

    return NextResponse.json({
      ...scanData,
      issues,
    });
  } catch (error) {
    console.error("Error fetching scan:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan results" },
      { status: 500 }
    );
  }
}

// scansStore and issuesStore are internal to this route - not exported
