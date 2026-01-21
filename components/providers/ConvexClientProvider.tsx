"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Get the Convex URL from environment variables
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Create the Convex client only if the URL is available
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // If Convex is not configured, show a helpful message in development
  if (!convex) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Convex Not Configured
            </h2>
            <p className="text-gray-600 mb-4">
              Please set up Convex to continue. Run these commands:
            </p>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-left text-sm font-mono mb-4">
              <p># Initialize Convex</p>
              <p>npx convex dev</p>
              <p className="mt-2"># This will create .env.local with</p>
              <p># NEXT_PUBLIC_CONVEX_URL</p>
            </div>
            <p className="text-sm text-gray-500">
              After running the command, restart your dev server.
            </p>
          </div>
        </div>
      );
    }
    // In production, render children without Convex (will fail gracefully)
    return <>{children}</>;
  }

  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
