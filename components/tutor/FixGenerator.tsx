"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";
import { MockySpeechBubble } from "@/components/mocky/MockySpeechBubble";
import { CodeBlock } from "./CodeBlock";
import { Wand2, Loader2, Copy, Check, RefreshCw, Terminal } from "lucide-react";

interface FixGeneratorProps {
  issueId: string;
  tableName: string;
  issueType: string;
  issueDescription: string;
  existingFix?: string;
  onFixGenerated?: (fix: string) => void;
}

export function FixGenerator({
  issueId,
  tableName,
  issueType,
  issueDescription,
  existingFix,
  onFixGenerated,
}: FixGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fix, setFix] = useState<{
    explanation: string;
    sql: string;
    agentPrompt: string;
  } | null>(existingFix ? { explanation: "", sql: existingFix, agentPrompt: "" } : null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFix = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId,
          tableName,
          issueType,
          issueDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate fix");
      }

      const data = await response.json();
      setFix(data);
      onFixGenerated?.(data.sql);
    } catch (err) {
      setError("Oops! Something went wrong. Let me try again...");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: "sql" | "prompt") => {
    await navigator.clipboard.writeText(text);
    if (type === "sql") {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      {!fix && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
            <CardContent className="p-8 text-center">
              <MockyAvatar expression="builder" size="lg" className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Ready to fix this?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                I&apos;ll generate a custom RLS policy for your <code className="bg-white px-1 rounded">{tableName}</code> table
                and a prompt you can give to your coding AI agent.
              </p>
              <Button
                variant="mocky"
                size="lg"
                onClick={generateFix}
                className="gap-2"
              >
                <Wand2 className="w-5 h-5" />
                Generate Fix with AI
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <Loader2 className="w-12 h-12 text-blue-500" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Generating your fix...
              </h3>
              <p className="text-gray-600">
                I&apos;m analyzing your table and creating a secure policy.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <MockyAvatar expression="concerned" size="md" />
                <div className="flex-1">
                  <p className="text-red-700 mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={generateFix}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Fix */}
      {fix && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Explanation */}
          {fix.explanation && (
            <div className="flex items-start gap-4">
              <MockyAvatar expression="builder" size="md" />
              <MockySpeechBubble position="left" className="flex-1">
                <p className="text-gray-700">{fix.explanation}</p>
              </MockySpeechBubble>
            </div>
          )}

          {/* SQL Code */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">SQL Fix</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(fix.sql, "sql")}
                  className="gap-2"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy SQL
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateFix}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CodeBlock code={fix.sql} language="sql" />
            </CardContent>
          </Card>

          {/* Agent Prompt */}
          {fix.agentPrompt && (
            <Card className="border-2 border-purple-200 bg-purple-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-600" />
                  Prompt for Your Coding Agent
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(fix.agentPrompt, "prompt")}
                  className="gap-2"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Prompt
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-700 mb-3">
                  Copy this prompt and paste it into Claude, Cursor, GitHub Copilot, or any other AI coding assistant:
                </p>
                <div className="bg-white border border-purple-200 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                  {fix.agentPrompt}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-green-800 mb-3">
                Two ways to apply this fix:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Option 1: Manual</h4>
                  <ol className="list-decimal list-inside space-y-1 text-green-700 text-sm">
                    <li>Go to Supabase Dashboard</li>
                    <li>Open SQL Editor</li>
                    <li>Paste the SQL above</li>
                    <li>Click &quot;Run&quot;</li>
                  </ol>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Option 2: AI Agent</h4>
                  <ol className="list-decimal list-inside space-y-1 text-green-700 text-sm">
                    <li>Copy the agent prompt above</li>
                    <li>Paste into your AI coding tool</li>
                    <li>Let the AI guide you through</li>
                    <li>Verify the changes</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
