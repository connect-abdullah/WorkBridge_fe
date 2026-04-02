import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ThemeApplicator } from "@/components/theme/ThemeApplicator";

export const metadata: Metadata = {
  title: "WorkBridge",
  description: "Freelancer-Client collaboration platform UI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <ThemeApplicator />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

