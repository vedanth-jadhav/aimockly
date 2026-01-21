import { NextRequest, NextResponse } from "next/server";
import { runSecurityScan } from "@/lib/scanner/rls-analyzer";

export async function POST(request: NextRequest) {
  try {
    const { url, anonKey, scanId, projectId } = await request.json();

    if (!url || !anonKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Run the security scan
    const scanResult = await runSecurityScan({ url, anonKey });

    return NextResponse.json({
      scanId,
      projectId,
      healthScore: scanResult.healthScore,
      tablesScanned: scanResult.tablesScanned,
      issues: scanResult.issues,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Failed to run security scan" },
      { status: 500 }
    );
  }
}
