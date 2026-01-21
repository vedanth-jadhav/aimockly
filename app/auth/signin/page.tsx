"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";
import { AuthForm } from "@/components/auth/AuthForm";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Check for redirect destination
      const redirectTo = sessionStorage.getItem("redirectAfterAuth") || "/dashboard";
      sessionStorage.removeItem("redirectAfterAuth");
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="container mx-auto px-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <MockyAvatar expression="default" size="sm" animate={false} />
          <span className="text-xl font-bold text-gray-800">Mockly</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <AuthForm />
      </div>
    </div>
  );
}
