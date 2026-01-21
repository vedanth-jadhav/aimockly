"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { UserButton } from "@/components/auth/UserButton";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ArrowLeft, Loader2, CheckCircle, Zap } from "lucide-react";

export default function BillingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const profile = useQuery(api.users.getCurrentProfile);

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

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "1 project",
        "1 free scan per project",
        "See all issues detected",
        "Basic fix suggestions",
      ],
      current: profile?.plan === "free",
    },
    {
      name: "Pro",
      price: "$19",
      period: "one-time",
      features: [
        "1 project",
        "Unlimited scans",
        "AI-powered fix generation",
        "Interactive tutor",
        "Security certificate",
        "30-day re-scan access",
      ],
      current: profile?.plan === "pro",
      popular: true,
    },
    {
      name: "Team",
      price: "$49",
      period: "one-time",
      features: [
        "Up to 5 projects",
        "Everything in Pro",
        "Priority support",
        "Team collaboration",
      ],
      current: profile?.plan === "team",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MockyAvatar expression="default" size="sm" animate={false} />
            <span className="text-xl font-bold text-gray-800">Mockly</span>
          </Link>
          <UserButton />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing</h1>
        <p className="text-gray-600 mb-8">
          Upgrade your plan for unlimited scans and AI-powered fixes
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? "border-2 border-blue-500" : ""
              } ${plan.current ? "bg-blue-50" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500"> / {plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.current ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? "mocky" : "outline"}
                    className="w-full gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade to {plan.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              No payment history yet
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
