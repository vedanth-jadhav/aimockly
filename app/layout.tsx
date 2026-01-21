import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mockly - Your Friendly Security Buddy",
  description:
    "Humane security auditing for Supabase apps. Mocky helps indie hackers and no-code builders find and fix security issues with warmth and education.",
  keywords: ["supabase", "security", "RLS", "row level security", "audit", "database security"],
  authors: [{ name: "Mockly" }],
  openGraph: {
    title: "Mockly - Your Friendly Security Buddy",
    description: "Humane security auditing for Supabase apps",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/30">
            {children}
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
