"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { UserButton } from "@/components/auth/UserButton";
import { ScanResults } from "@/components/scanner/ScanResults";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";
import { ArrowLeft, Loader2 } from "lucide-react";

function ResultsPageContent() {
  const params = useParams();
  const scanId = params.scanId as string;

  const scanData = useQuery(api.scans.getScanWithIssues, {
    scanId: scanId as Id<"scans">,
  });

  if (scanData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (scanData === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <MockyAvatar expression="concerned" size="xl" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find those scan results. They may have expired or you don&apos;t have access.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Start a new scan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {/* Navigation */}
      <nav className="container mx-auto px-4 mb-8 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <UserButton />
      </nav>

      {/* Results */}
      <div className="container mx-auto px-4 max-w-4xl">
        <ScanResults
          scanId={scanId}
          healthScore={scanData.healthScore || 0}
          tablesScanned={scanData.tablesScanned || 0}
          issues={scanData.issues.map((issue) => ({
            _id: issue._id,
            type: issue.type,
            severity: issue.severity,
            tableName: issue.tableName,
            title: issue.title,
            description: issue.description,
            isResolved: issue.isResolved,
          }))}
        />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <RequireAuth>
      <ResultsPageContent />
    </RequireAuth>
  );
}
