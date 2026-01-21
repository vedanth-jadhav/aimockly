"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { UserButton } from "@/components/auth/UserButton";
import { ScanForm } from "@/components/scanner/ScanForm";
import { ScanProgress } from "@/components/scanner/ScanProgress";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";
import { ArrowLeft } from "lucide-react";

function ScanPageContent() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);

  const createProject = useMutation(api.projects.createProject);
  const createScan = useMutation(api.scans.createScan);
  const updateScan = useMutation(api.scans.updateScan);
  const createIssues = useMutation(api.issues.createIssues);

  const handleSubmit = async (data: { url: string; anonKey: string }) => {
    setIsScanning(true);

    try {
      // Create or get project
      const projectId = await createProject({
        name: new URL(data.url).hostname.split('.')[0],
        supabaseUrl: data.url,
      });

      // Create scan record
      const scanId = await createScan({ projectId });

      // Update scan status to scanning
      await updateScan({ scanId, status: "scanning" });

      // Run the actual scan via API
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.url,
          anonKey: data.anonKey,
          scanId: scanId,
          projectId: projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Scan failed");
      }

      const result = await response.json();

      // Create issues in database
      if (result.issues && result.issues.length > 0) {
        await createIssues({
          scanId,
          projectId,
          issues: result.issues.map((issue: any) => ({
            type: issue.type,
            severity: issue.severity,
            tableName: issue.tableName,
            title: issue.title,
            description: issue.description,
            technicalDetails: issue.technicalDetails,
            suggestedFix: issue.suggestedFix,
          })),
        });
      }

      // Update scan with results
      await updateScan({
        scanId,
        status: "completed",
        healthScore: result.healthScore,
        issuesFound: result.issues?.length || 0,
        tablesScanned: result.tablesScanned,
      });

      router.push(`/results/${scanId}`);
    } catch (error) {
      console.error("Scan error:", error);
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      {/* Navigation */}
      <nav className="container mx-auto px-4 mb-8 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <UserButton />
      </nav>

      {/* Header */}
      <div className="container mx-auto px-4 text-center mb-8">
        <div className="flex justify-center mb-4">
          <MockyAvatar expression="support" size="lg" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Scan Your Supabase Project
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Enter your project details below and I&apos;ll check for security issues.
          This takes about 30 seconds.
        </p>
      </div>

      {/* Scan Form */}
      <div className="container mx-auto px-4">
        <ScanForm onSubmit={handleSubmit} isLoading={isScanning} />
      </div>

      {/* Scanning Progress Overlay */}
      <ScanProgress isScanning={isScanning} />
    </div>
  );
}

export default function ScanPage() {
  return (
    <RequireAuth>
      <ScanPageContent />
    </RequireAuth>
  );
}
