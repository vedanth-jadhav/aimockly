"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";
import { Shield, Key, ExternalLink } from "lucide-react";

interface ScanFormProps {
  onSubmit: (data: { url: string; anonKey: string }) => void;
  isLoading?: boolean;
}

export function ScanForm({ onSubmit, isLoading = false }: ScanFormProps) {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [errors, setErrors] = useState<{ url?: string; anonKey?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { url?: string; anonKey?: string } = {};

    if (!url) {
      newErrors.url = "Project URL is required";
    } else if (!url.includes(".supabase.co")) {
      newErrors.url = "Please enter a valid Supabase project URL";
    }

    if (!anonKey) {
      newErrors.anonKey = "Anon key is required";
    } else if (!anonKey.startsWith("eyJ")) {
      newErrors.anonKey = "Please enter a valid Supabase anon key";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ url, anonKey });
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center mb-4"
        >
          <MockyAvatar expression="support" size="lg" />
        </motion.div>
        <CardTitle className="text-2xl">Let&apos;s scan your project!</CardTitle>
        <CardDescription>
          Enter your Supabase project details below. Don&apos;t worry - we only perform
          read-only checks and never modify your data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="url"
              className="text-sm font-medium flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Project URL
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={errors.url ? "border-red-500" : ""}
            />
            {errors.url && (
              <p className="text-sm text-red-500">{errors.url}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Find this in your Supabase dashboard → Settings → API
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="anonKey"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Anon Key (public)
            </label>
            <Input
              id="anonKey"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className={errors.anonKey ? "border-red-500" : ""}
            />
            {errors.anonKey && (
              <p className="text-sm text-red-500">{errors.anonKey}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This is your public anon key, safe to use for scanning
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">What we check:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside text-blue-700">
                  <li>Tables accessible with the anon key</li>
                  <li>Row Level Security (RLS) policies</li>
                  <li>Sensitive data exposure</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="mocky"
            size="xl"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Start Security Scan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
