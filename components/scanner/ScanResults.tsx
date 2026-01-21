"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";
import { MockySpeechBubble } from "@/components/mocky/MockySpeechBubble";
import { getHealthScoreColor, getHealthScoreLabel } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, ChevronRight, Shield } from "lucide-react";

interface Issue {
  _id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  tableName: string;
  title: string;
  description: string;
  isResolved: boolean;
}

interface ScanResultsProps {
  scanId: string;
  healthScore: number;
  tablesScanned: number;
  issues: Issue[];
}

export function ScanResults({ scanId, healthScore, tablesScanned, issues }: ScanResultsProps) {
  const criticalCount = issues.filter((i) => i.severity === "critical" && !i.isResolved).length;
  const warningCount = issues.filter((i) => i.severity === "warning" && !i.isResolved).length;
  const infoCount = issues.filter((i) => i.severity === "info" && !i.isResolved).length;
  const resolvedCount = issues.filter((i) => i.isResolved).length;

  const getMockyExpression = () => {
    if (criticalCount > 0) return "concerned";
    if (warningCount > 0) return "support";
    if (issues.length === 0 || resolvedCount === issues.length) return "celebration";
    return "default";
  };

  const getMockyMessage = () => {
    if (criticalCount > 0) {
      return (
        <>
          <span className="font-semibold">Uh oh!</span> I found some critical issues that need your attention right away.
          Don&apos;t worry though - I&apos;ll help you fix them! 💪
        </>
      );
    }
    if (warningCount > 0) {
      return (
        <>
          <span className="font-semibold">Good news and not-so-good news!</span> Your app is mostly secure,
          but there are a few things we should look at together.
        </>
      );
    }
    if (issues.length === 0 || resolvedCount === issues.length) {
      return (
        <>
          <span className="font-semibold">Woohoo! 🎉</span> Your Supabase project looks great!
          All security checks passed.
        </>
      );
    }
    return (
      <>
        <span className="font-semibold">Scan complete!</span> I found a few things worth looking at.
        Let me walk you through each one.
      </>
    );
  };

  const getSeverityIcon = (severity: "critical" | "warning" | "info") => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: "critical" | "warning" | "info") => {
    return (
      <Badge variant={severity}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Health Score Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium opacity-90">Security Health Score</h2>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-bold">{healthScore}</span>
                  <span className="text-2xl opacity-75">/100</span>
                </div>
                <p className="mt-2 opacity-80">
                  {getHealthScoreLabel(healthScore)} • {tablesScanned} tables scanned
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20`}>
                  <span className={`text-lg font-semibold ${getHealthScoreColor(healthScore).replace('text-', 'text-white')}`}>
                    {getHealthScoreLabel(healthScore)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <MockyAvatar expression={getMockyExpression()} size="lg" />
              <MockySpeechBubble className="flex-1" position="left">
                {getMockyMessage()}
              </MockySpeechBubble>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Issue Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className={`${criticalCount > 0 ? 'border-red-200 bg-red-50' : ''}`}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${criticalCount > 0 ? 'text-red-500' : 'text-gray-300'}`} />
            <p className="text-2xl font-bold">{criticalCount}</p>
            <p className="text-sm text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        <Card className={`${warningCount > 0 ? 'border-amber-200 bg-amber-50' : ''}`}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${warningCount > 0 ? 'text-amber-500' : 'text-gray-300'}`} />
            <p className="text-2xl font-bold">{warningCount}</p>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
        <Card className={`${infoCount > 0 ? 'border-blue-200 bg-blue-50' : ''}`}>
          <CardContent className="p-4 text-center">
            <Info className={`w-8 h-8 mx-auto mb-2 ${infoCount > 0 ? 'text-blue-500' : 'text-gray-300'}`} />
            <p className="text-2xl font-bold">{infoCount}</p>
            <p className="text-sm text-muted-foreground">Info</p>
          </CardContent>
        </Card>
        <Card className={`${resolvedCount > 0 ? 'border-green-200 bg-green-50' : ''}`}>
          <CardContent className="p-4 text-center">
            <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${resolvedCount > 0 ? 'text-green-500' : 'text-gray-300'}`} />
            <p className="text-2xl font-bold">{resolvedCount}</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Issues List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {issues.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">All Clear!</h3>
                <p className="text-muted-foreground mt-2">
                  No security issues detected. Your Supabase project is looking good!
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {issues.map((issue, index) => (
                  <motion.div
                    key={issue._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={`/tutor/${issue._id}?scanId=${scanId}`}
                      className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                        issue.isResolved ? 'opacity-60' : ''
                      }`}
                    >
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-medium ${issue.isResolved ? 'line-through' : ''}`}>
                            {issue.title}
                          </h4>
                          {getSeverityBadge(issue.severity)}
                          {issue.isResolved && (
                            <Badge variant="success">Resolved</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {issue.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Table: <code className="bg-gray-100 px-1 rounded">{issue.tableName}</code>
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button variant="outline" asChild>
          <Link href="/scan">Scan Another Project</Link>
        </Button>
        {issues.some(i => !i.isResolved) && (
          <Button variant="mocky" asChild>
            <Link href={`/tutor/${issues.find(i => !i.isResolved)?._id}?scanId=${scanId}`}>
              Start Fixing Issues
            </Link>
          </Button>
        )}
      </motion.div>
    </div>
  );
}
