"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { UserButton } from "@/components/auth/UserButton";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Shield,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  const profile = useQuery(api.users.getCurrentProfile);
  const projects = useQuery(api.projects.getProjects);
  const recentScans = useQuery(api.scans.getRecentScans, { limit: 5 });
  const issueStats = useQuery(api.issues.getIssueStats);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MockyAvatar expression="default" size="sm" animate={false} />
            <span className="text-xl font-bold text-gray-800">Mockly</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="mocky" size="sm" asChild>
              <Link href="/scan">
                <Plus className="w-4 h-4 mr-2" />
                New Scan
              </Link>
            </Button>
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{profile?.name ? `, ${profile.name}` : ""}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s an overview of your security status
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{projects?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Projects</p>
            </CardContent>
          </Card>
          <Card className={issueStats?.critical ? "border-red-200 bg-red-50" : ""}>
            <CardContent className="p-4 text-center">
              <AlertTriangle
                className={`w-8 h-8 mx-auto mb-2 ${
                  issueStats?.critical ? "text-red-500" : "text-gray-300"
                }`}
              />
              <p className="text-2xl font-bold">{issueStats?.critical || 0}</p>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </CardContent>
          </Card>
          <Card className={issueStats?.warning ? "border-amber-200 bg-amber-50" : ""}>
            <CardContent className="p-4 text-center">
              <AlertTriangle
                className={`w-8 h-8 mx-auto mb-2 ${
                  issueStats?.warning ? "text-amber-500" : "text-gray-300"
                }`}
              />
              <p className="text-2xl font-bold">{issueStats?.warning || 0}</p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </CardContent>
          </Card>
          <Card className={issueStats?.resolved ? "border-green-200 bg-green-50" : ""}>
            <CardContent className="p-4 text-center">
              <CheckCircle
                className={`w-8 h-8 mx-auto mb-2 ${
                  issueStats?.resolved ? "text-green-500" : "text-gray-300"
                }`}
              />
              <p className="text-2xl font-bold">{issueStats?.resolved || 0}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Projects Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Projects</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/scan">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {!projects?.length ? (
                  <div className="text-center py-8">
                    <MockyAvatar expression="support" size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      No projects yet. Start by scanning your first Supabase project!
                    </p>
                    <Button variant="mocky" asChild>
                      <Link href="/scan">Start Scanning</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div
                        key={project._id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {project.supabaseUrl}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{project.totalScans} scans</Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/scan?project=${project._id}`}>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Scans Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!recentScans?.length ? (
                  <p className="text-center text-gray-500 py-8">
                    No scans yet. Run your first security scan!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentScans.map((scan) => (
                      <Link
                        key={scan._id}
                        href={`/results/${scan._id}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{scan.project?.name || "Unknown Project"}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(scan.startedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {scan.status === "completed" && (
                            <>
                              <Badge
                                variant={
                                  (scan.healthScore || 0) >= 80
                                    ? "success"
                                    : (scan.healthScore || 0) >= 60
                                    ? "warning"
                                    : "critical"
                                }
                              >
                                {scan.healthScore || 0}/100
                              </Badge>
                              <Badge variant="default">
                                {scan.issuesFound || 0} issues
                              </Badge>
                            </>
                          )}
                          {scan.status === "scanning" && (
                            <Badge variant="info">Scanning...</Badge>
                          )}
                          {scan.status === "failed" && (
                            <Badge variant="critical">Failed</Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Plan Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-blue-100">Current Plan</p>
                <p className="text-2xl font-bold capitalize">{profile?.plan || "Free"}</p>
                <p className="text-blue-100 text-sm mt-1">
                  {profile?.plan === "free"
                    ? "Upgrade for unlimited scans and AI-powered fixes"
                    : `Up to ${profile?.projectsLimit || 1} projects`}
                </p>
              </div>
              {profile?.plan === "free" && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  asChild
                >
                  <Link href="/dashboard/billing">Upgrade Now</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
