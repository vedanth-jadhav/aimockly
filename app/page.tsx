"use client";

import React from "react";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";
import { UserButton } from "@/components/auth/UserButton";
import {
  Shield,
  Zap,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Database,
  Lock,
  Eye,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MockyAvatar expression="default" size="sm" animate={false} />
          <span className="text-xl font-bold text-gray-800">Mockly</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
                Dashboard
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-gray-600 hover:text-gray-800">
                Sign In
              </Link>
              <Button variant="mocky" size="sm" asChild>
                <Link href="/auth/signin">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-8">
              <MockyAvatar expression="support" size="xl" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Friendly{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                Security Buddy
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Scan your Supabase app for security issues in 30 seconds.
              Mocky explains problems in plain English and helps you fix them
              with AI-powered solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="mocky" size="xl" asChild>
                <Link href={isAuthenticated ? "/scan" : "/auth/signin"} className="gap-2">
                  <Shield className="w-5 h-5" />
                  {isAuthenticated ? "Start Scanning" : "Get Started Free"}
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="#how-it-works" className="gap-2">
                  <BookOpen className="w-5 h-5" />
                  See How It Works
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-8 text-gray-500"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Read-only scanning</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>No credentials stored</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Results in 30 seconds</span>
          </div>
        </motion.div>
      </section>

      {/* What We Check */}
      <section className="container mx-auto px-4 py-16" id="what-we-check">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Mocky Checks For
            </h2>
            <p className="text-gray-600">
              A comprehensive security scan focused on common Supabase vulnerabilities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <CardContent className="pt-4">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">RLS Policies</h3>
                <p className="text-sm text-gray-600">
                  Detect missing or overly permissive Row Level Security policies
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Database className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Public Tables</h3>
                <p className="text-sm text-gray-600">
                  Find tables that are accessible to anyone with your anon key
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Sensitive Data</h3>
                <p className="text-sm text-gray-600">
                  Identify exposed columns containing passwords, tokens, or PII
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50/50 py-16" id="how-it-works">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-gray-600">
                Three simple steps to a more secure Supabase app
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  step: 1,
                  title: "Sign in with Google",
                  description: "Quick and secure authentication to keep your scans private.",
                  expression: "support" as const,
                  message: "Just one click and you're in! Your scan results are saved securely.",
                },
                {
                  step: 2,
                  title: "Enter Your Project Details",
                  description: "Paste your Supabase URL and anon key. We only use these for read-only scanning.",
                  expression: "default" as const,
                  message: "Your anon key is safe to share - it's meant to be public! I'll only read, never write.",
                },
                {
                  step: 3,
                  title: "Get AI-Powered Fixes",
                  description: "Click on any issue and I'll generate a custom fix you can copy and paste.",
                  expression: "builder" as const,
                  message: "Here's the exact SQL you need! I've added comments so you know what each part does.",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex items-start gap-4">
                      <MockyAvatar expression={item.expression} size="md" />
                      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex-1">
                        <p className="text-gray-700">{item.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <MockyAvatar expression="celebration" size="xl" className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to secure your app?
          </h2>
          <p className="text-gray-600 mb-8">
            Join developers who trust Mocky to keep their Supabase apps safe.
          </p>
          <Button variant="mocky" size="xl" asChild>
            <Link href={isAuthenticated ? "/scan" : "/auth/signin"} className="gap-2">
              {isAuthenticated ? "Start Scanning" : "Get Started Free"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MockyAvatar expression="default" size="sm" animate={false} />
            <span className="text-gray-600">
              © 2024 Mockly. Your friendly security buddy.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-gray-800">Privacy</Link>
            <Link href="#" className="hover:text-gray-800">Terms</Link>
            <Link href="#" className="hover:text-gray-800">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
