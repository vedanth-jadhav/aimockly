"use client";

import React, { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { UserButton } from "@/components/auth/UserButton";
import { IssueExplainer } from "@/components/tutor/IssueExplainer";
import { FixGenerator } from "@/components/tutor/FixGenerator";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, RefreshCw } from "lucide-react";

function TutorPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const issueId = params.issueId as string;
  const scanId = searchParams.get("scanId");

  const issue = useQuery(api.issues.getIssue, {
    issueId: issueId as Id<"issues">,
  });
  const resolveIssue = useMutation(api.issues.resolveIssue);
  const updateIssueWithFix = useMutation(api.issues.updateIssueWithFix);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      await resolveIssue({ issueId: issueId as Id<"issues"> });
      setVerified(true);
    } catch (error) {
      console.error("Failed to resolve issue:", error);
    }

    setIsVerifying(false);
  };

  const handleFixGenerated = async (sql: string, agentPrompt?: string) => {
    try {
      await updateIssueWithFix({
        issueId: issueId as Id<"issues">,
        aiGeneratedFix: sql,
        aiAgentPrompt: agentPrompt,
      });
    } catch (error) {
      console.error("Failed to save fix:", error);
    }
  };

  if (issue === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (issue === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <MockyAvatar expression="concerned" size="xl" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find that issue. It may have been resolved or you don&apos;t have access.
          </p>
          <Link
            href={scanId ? `/results/${scanId}` : "/dashboard"}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
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
          href={scanId ? `/results/${scanId}` : "/dashboard"}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Link>
        <UserButton />
      </nav>

      <div className="container mx-auto px-4 max-w-3xl">
        {/* Issue Explainer */}
        <div className="mb-8">
          <IssueExplainer
            title={issue.title}
            description={issue.description}
            severity={issue.severity}
            tableName={issue.tableName}
            technicalDetails={issue.technicalDetails}
          />
        </div>

        {/* Fix Generator */}
        {!verified && !issue.isResolved && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Let&apos;s Fix This
            </h2>
            <FixGenerator
              issueId={issueId}
              tableName={issue.tableName}
              issueType={issue.type}
              issueDescription={issue.description}
              existingFix={issue.aiGeneratedFix}
              onFixGenerated={(sql) => handleFixGenerated(sql)}
            />
          </div>
        )}

        {/* Verification Section */}
        {!verified && !issue.isResolved ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <MockyAvatar expression="support" size="md" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800 mb-2">
                      Applied the fix?
                    </h3>
                    <p className="text-green-700 text-sm mb-4">
                      Once you&apos;ve run the SQL in your Supabase dashboard,
                      click below and I&apos;ll mark it as resolved!
                    </p>
                    <Button
                      variant="mocky"
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="gap-2"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          I Fixed It! Mark as Resolved
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-2 border-green-300 bg-green-100">
              <CardContent className="p-6 text-center">
                <MockyAvatar expression="celebration" size="lg" className="mx-auto mb-4" />
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-green-800">
                    Awesome! Issue Resolved!
                  </h3>
                </div>
                <p className="text-green-700 mb-4">
                  Great job! This security issue has been marked as resolved. 🎉
                </p>
                <Button variant="outline" asChild>
                  <Link href={scanId ? `/results/${scanId}` : "/dashboard"}>
                    Back to Results
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function TutorPage() {
  return (
    <RequireAuth>
      <TutorPageContent />
    </RequireAuth>
  );
}
