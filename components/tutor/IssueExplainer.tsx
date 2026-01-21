"use client";

import React from "react";
import { motion } from "framer-motion";
import { MockyAvatar, MockyExpression } from "@/components/mocky/MockyAvatar";
import { MockySpeechBubble } from "@/components/mocky/MockySpeechBubble";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Info, Database } from "lucide-react";

interface IssueExplainerProps {
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  tableName: string;
  technicalDetails?: string;
}

export function IssueExplainer({
  title,
  description,
  severity,
  tableName,
  technicalDetails,
}: IssueExplainerProps) {
  const getMockyExpression = (): MockyExpression => {
    switch (severity) {
      case "critical":
        return "concerned";
      case "warning":
        return "support";
      default:
        return "default";
    }
  };

  const getSeverityMessage = () => {
    switch (severity) {
      case "critical":
        return "This is a critical issue that needs immediate attention!";
      case "warning":
        return "This is something we should look at, but it's not urgent.";
      case "info":
        return "Just a heads up! This is good to know about.";
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        {getSeverityIcon()}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <Badge variant={severity}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Database className="w-4 h-4" />
            <span>Table: </span>
            <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">
              {tableName}
            </code>
          </div>
        </div>
      </motion.div>

      {/* Mocky Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-4"
      >
        <MockyAvatar expression={getMockyExpression()} size="lg" />
        <div className="flex-1 space-y-3">
          <MockySpeechBubble position="left">
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </MockySpeechBubble>
          <MockySpeechBubble position="left">
            <p className="text-gray-600 text-sm">{getSeverityMessage()}</p>
          </MockySpeechBubble>
        </div>
      </motion.div>

      {/* Why This Matters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-5"
      >
        <h3 className="font-semibold text-amber-800 mb-2">
          🤔 Why does this matter?
        </h3>
        <p className="text-amber-700 text-sm leading-relaxed">
          {severity === "critical" && (
            <>
              Without proper protection, anyone who knows your Supabase URL and anon key
              can access this data. This includes potential attackers who might scrape
              your frontend code to find these credentials.
            </>
          )}
          {severity === "warning" && (
            <>
              While not immediately dangerous, leaving this unaddressed could lead to
              data leaks or unauthorized access in the future. It&apos;s best to fix this
              before your app grows.
            </>
          )}
          {severity === "info" && (
            <>
              This is more of a best practice recommendation. Following this advice will
              make your application more secure and maintainable in the long run.
            </>
          )}
        </p>
      </motion.div>

      {/* Technical Details */}
      {technicalDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 border border-gray-200 rounded-xl p-5"
        >
          <h3 className="font-semibold text-gray-800 mb-2">
            🔧 Technical Details
          </h3>
          <p className="text-gray-600 text-sm font-mono">{technicalDetails}</p>
        </motion.div>
      )}
    </div>
  );
}
